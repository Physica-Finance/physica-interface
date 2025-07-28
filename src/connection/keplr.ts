import { initializeConnector } from '@web3-react/core'
import { EIP1193 } from '@web3-react/eip1193'

export class NoKeplrError extends Error {
  public constructor() {
    super('Keplr not installed')
    this.name = NoKeplrError.name
    Object.setPrototypeOf(this, NoKeplrError.prototype)
  }
}

declare global {
  interface Window {
    keplr?: {
      ethereum?: any
      enable: (chainId: string) => Promise<void>
      getKey: (chainId: string) => Promise<any>
      experimentalSuggestChain: (chainInfo: any) => Promise<void>
    }
  }
}

// Keplr provider wrapper that lazy-loads the actual provider
class KeplrProvider {
  private provider: any | null = null
  private initialized = false
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map()

  async getProvider() {
    if (this.initialized) {
      return this.provider
    }

    if (!window.keplr) {
      throw new NoKeplrError()
    }

    // First, suggest the Planq chain to Keplr
    try {
      await window.keplr.experimentalSuggestChain({
        chainId: 'planq_7070-2',
        chainName: 'Planq Mainnet',
        rpc: 'https://evm-rpc.planq.network',
        rest: 'https://rest.planq.network',
        bip44: {
          coinType: 60, // ETH coin type for EVM compatibility
        },
        bech32Config: {
          bech32PrefixAccAddr: 'plq',
          bech32PrefixAccPub: 'plqpub',
          bech32PrefixValAddr: 'plqvaloper',
          bech32PrefixValPub: 'plqvaloperpub',
          bech32PrefixConsAddr: 'plqvalcons',
          bech32PrefixConsPub: 'plqvalconspub',
        },
        currencies: [
          {
            coinDenom: 'PLQ',
            coinMinimalDenom: 'aplanq',
            coinDecimals: 18,
            coinGeckoId: 'planq',
          },
        ],
        feeCurrencies: [
          {
            coinDenom: 'PLQ',
            coinMinimalDenom: 'aplanq',
            coinDecimals: 18,
            coinGeckoId: 'planq',
          },
        ],
        stakeCurrency: {
          coinDenom: 'PLQ',
          coinMinimalDenom: 'aplanq',
          coinDecimals: 18,
          coinGeckoId: 'planq',
        },
        gasPriceStep: {
          low: 20000000000,
          average: 25000000000,
          high: 40000000000,
        },
        features: ['eth-address-gen', 'eth-key-sign'],
      })
    } catch (error) {
      console.error('Failed to suggest Planq chain to Keplr:', error)
    }

    // Check if Keplr has ethereum provider
    if (window.keplr.ethereum) {
      this.provider = window.keplr.ethereum
    } else {
      // Fallback: Create a minimal provider that wraps Keplr
      this.provider = {
        isKeplr: true,
        isMetaMask: false,
        request: async ({ method, params }: { method: string; params?: any[] }) => {
          switch (method) {
            case 'eth_requestAccounts':
            case 'eth_accounts': {
              await window.keplr!.enable('planq_7070-2')
              const key = await window.keplr!.getKey('planq_7070-2')
              return key.ethereumHexAddress ? [key.ethereumHexAddress] : []
            }
            case 'eth_chainId':
              return '0x1b9e' // 7070 in hex
            case 'net_version':
              return '7070'
            default:
              return await window.keplr!.ethereum!.request({ method, params })
          }
        },
        on: (event: string, handler: (...args: any[]) => void) => {
          this.on(event, handler)
        },
        removeListener: (_event: string, _handler: (...args: any[]) => void) => {
          // Basic event emitter stub
        },
      }
    }

    this.initialized = true
    return this.provider
  }

  // EIP-1193 compliant request method
  async request(args: { method: string; params?: any[] }): Promise<unknown> {
    const provider = await this.getProvider()
    return provider.request(args)
  }

  // Event emitter methods
  on(eventName: string, handler: (...args: any[]) => void): this {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set())
    }
    this.listeners.get(eventName)!.add(handler)
    return this
  }

  removeListener(eventName: string, handler: (...args: any[]) => void): this {
    const handlers = this.listeners.get(eventName)
    if (handlers) {
      handlers.delete(handler)
    }
    return this
  }
}

// Create a singleton instance of KeplrProvider
const keplrProvider = new KeplrProvider()

// Initialize Keplr connector using EIP1193
export const [keplrConnector, keplrHooks] = initializeConnector<EIP1193>(
  (actions) =>
    new EIP1193({
      actions,
      provider: keplrProvider as any,
      onError: (error: Error) => {
        console.error('Keplr connection error:', error)
      },
    })
)
