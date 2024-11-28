import { QueryResult } from '@apollo/client'
import { SupportedChainId } from 'constants/chains'
import { NATIVE_CHAIN_ID, nativeOnChain, WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import ms from 'ms.macro'
import { useEffect } from 'react'

import { Chain, HistoryDuration } from '../data/__generated__/types-and-hooks'

export enum PollingInterval {
  Slow = ms`5m`,
  Normal = ms`1m`,
  Fast = ms`12s`, // 12 seconds, block times for mainnet
  LightningMcQueen = ms`3s`, // 3 seconds, approx block times for polygon
}

// Polls a query only when the current component is mounted, as useQuery's pollInterval prop will continue to poll after unmount
export function usePollQueryWhileMounted<T, K>(queryResult: QueryResult<T, K>, interval: PollingInterval) {
  const { startPolling, stopPolling } = queryResult

  useEffect(() => {
    startPolling(interval)
    return stopPolling
  }, [interval, startPolling, stopPolling])

  return queryResult
}

export enum TimePeriod {
  HOUR,
  DAY,
  WEEK,
  MONTH,
  YEAR,
}

export function toHistoryDuration(timePeriod: TimePeriod): HistoryDuration {
  switch (timePeriod) {
    case TimePeriod.HOUR:
      return HistoryDuration.Hour
    case TimePeriod.DAY:
      return HistoryDuration.Day
    case TimePeriod.WEEK:
      return HistoryDuration.Week
    case TimePeriod.MONTH:
      return HistoryDuration.Month
    case TimePeriod.YEAR:
      return HistoryDuration.Year
  }
}

export type PricePoint = { date?: number; priceUSD?: string; id?: string }

export function isPricePoint(p: PricePoint | null): p is PricePoint {
  return p !== null
}

export type LaunchFactoryPricePoint = { timestamp?: number; price?: string; id?: string }

export function isLaunchFactoryPricePoint(p: LaunchFactoryPricePoint | null): p is LaunchFactoryPricePoint {
  return p !== null
}

export const CHAIN_ID_TO_BACKEND_NAME: { [key: number]: Chain } = {
  [SupportedChainId.MAINNET]: Chain.Ethereum,
  [SupportedChainId.GOERLI]: Chain.EthereumGoerli,
  [SupportedChainId.POLYGON]: Chain.Polygon,
  [SupportedChainId.POLYGON_MUMBAI]: Chain.Polygon,
  [SupportedChainId.CELO]: Chain.Celo,
  [SupportedChainId.CELO_ALFAJORES]: Chain.Celo,
  [SupportedChainId.ARBITRUM_ONE]: Chain.Arbitrum,
  [SupportedChainId.ARBITRUM_RINKEBY]: Chain.Arbitrum,
  [SupportedChainId.OPTIMISM]: Chain.Optimism,
  [SupportedChainId.OPTIMISM_GOERLI]: Chain.Optimism,
  [SupportedChainId.PLANQ]: Chain.Planq,
}

export function chainIdToBackendName(chainId: number | undefined) {
  return chainId && CHAIN_ID_TO_BACKEND_NAME[chainId]
    ? CHAIN_ID_TO_BACKEND_NAME[chainId]
    : CHAIN_ID_TO_BACKEND_NAME[SupportedChainId.PLANQ]
}

const URL_CHAIN_PARAM_TO_BACKEND: { [key: string]: Chain } = {
  ethereum: Chain.Ethereum,
  polygon: Chain.Polygon,
  celo: Chain.Celo,
  arbitrum: Chain.Arbitrum,
  optimism: Chain.Optimism,
  planq: Chain.Planq,
}

export function validateUrlChainParam(chainName: string | undefined) {
  return chainName && URL_CHAIN_PARAM_TO_BACKEND[chainName] ? URL_CHAIN_PARAM_TO_BACKEND[chainName] : Chain.Planq
}

export const CHAIN_NAME_TO_CHAIN_ID: { [key: string]: SupportedChainId } = {
  ETHEREUM: SupportedChainId.MAINNET,
  POLYGON: SupportedChainId.POLYGON,
  CELO: SupportedChainId.CELO,
  ARBITRUM: SupportedChainId.ARBITRUM_ONE,
  OPTIMISM: SupportedChainId.OPTIMISM,
  PLANQ: SupportedChainId.PLANQ,
}

export const BACKEND_CHAIN_NAMES: Chain[] = []

export function getTokenDetailsURL({ id }: { id?: string | null }) {
  return `/tokens/planq/${id ?? NATIVE_CHAIN_ID}`
}

export function getLaunchFactoryTokenDetailsURL({ id }: { id?: string | null }) {
  return `/launchpad/planq/${id ?? NATIVE_CHAIN_ID}`
}

export function unwrapToken<
  T extends {
    id?: string | null | undefined
  } | null
>(chainId: number, token: T): T {
  if (!token?.id) return token

  const address = token.id.toLowerCase()
  const nativeAddress = WRAPPED_NATIVE_CURRENCY[chainId]?.address.toLowerCase()
  if (address !== nativeAddress) return token

  const nativeToken = nativeOnChain(chainId)
  return {
    ...token,
    ...nativeToken,
    address: NATIVE_CHAIN_ID,
    extensions: undefined, // prevents marking cross-chain wrapped tokens as native
  }
}
