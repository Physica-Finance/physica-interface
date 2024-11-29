import TokenLogoLookupTable from 'constants/TokenLogoLookupTable'
import { chainIdToNetworkName, getNativeLogoURI } from 'lib/hooks/useCurrencyLogoURIs'
import uriToHttp from 'lib/utils/uriToHttp'
import { useCallback, useEffect, useState } from 'react'
import { isAddress } from 'utils'
import { useMetaManagerContract } from './useContract'
import { getMultihashFromContractResponse } from '../utils/multihash'
import { fetchMetaFromPinataIPFS } from '../components/LaunchFactory/utils'

const BAD_SRCS: { [tokenAddress: string]: true } = {}

// Converts uri's into fetchable urls
function parseLogoSources(uris: string[]) {
  const urls: string[] = []
  uris.forEach((uri) => urls.push(...uriToHttp(uri)))
  return urls
}

// Parses uri's, favors non-coingecko images, and improves coingecko logo quality
function prioritizeLogoSources(uris: string[]) {
  const parsedUris = uris.map((uri) => uriToHttp(uri)).flat(1)
  const preferredUris: string[] = []

  // Consolidate duplicate coingecko urls into one fallback source
  let coingeckoUrl: string | undefined = undefined

  parsedUris.forEach((uri) => {
    if (uri.startsWith('https://assets.coingecko')) {
      if (!coingeckoUrl) {
        coingeckoUrl = uri.replace(/small|thumb/g, 'large')
      }
    } else {
      preferredUris.push(uri)
    }
  })
  // Places coingecko urls in the back of the source array
  return coingeckoUrl ? [...preferredUris, coingeckoUrl] : preferredUris
}

function getInitialUrl(address?: string | null, chainId?: number | null, isNative?: boolean) {
  if (chainId && isNative) return getNativeLogoURI(chainId)

  const networkName = chainId ? chainIdToNetworkName(chainId) : 'ethereum'
  const checksummedAddress = isAddress(address)
  if (checksummedAddress) {
    return `https://raw.githubusercontent.com/SynergyNodes/assets-all/master/blockchains/${networkName}/assets/${checksummedAddress}/logo.png`
  } else {
    return undefined
  }
}

export default function useAssetLogoSource(
  address?: string | null,
  chainId?: number | null,
  isNative?: boolean,
  backupImg?: string | null
): [string | undefined, () => void] {
  const [current, setCurrent] = useState<string | undefined>(getInitialUrl(address, chainId, isNative))
  const [fallbackSrcs, setFallbackSrcs] = useState<string[] | undefined>(undefined)
  const [metaEntry, setMetaEntry] = useState<string | undefined>(undefined)
  const [metaJson, setMetaJson] = useState<any | undefined>(undefined)
  const metaManager = useMetaManagerContract()

  useEffect(() => {
    if (!metaJson) {
      if(metaEntry !== undefined)
      fetchMetaFromPinataIPFS(metaEntry ?? '').then((meta) => setMetaJson(meta))
    }
  }, [metaEntry])

  useEffect(() => {
    if (metaJson) {
      if(metaJson?.image !== undefined || metaJson?.image !== '')
      setCurrent('https://red-diverse-turkey-545.mypinata.cloud/ipfs/' + metaJson?.image)
    }
  }, [metaJson])

  useEffect(() => {
    setCurrent(getInitialUrl(address, chainId, isNative))
    setFallbackSrcs(undefined)
  }, [address, chainId, isNative])

  const nextSrc = useCallback(() => {
    if (current) {
      BAD_SRCS[current] = true
    }
    // Parses and stores logo sources from tokenlists if assets repo url fails
    if (!fallbackSrcs) {
      const uris = TokenLogoLookupTable.getIcons(address, chainId) ?? []
      if (backupImg) uris.push(backupImg)
      const tokenListIcons = prioritizeLogoSources(parseLogoSources(uris))

      if (
        tokenListIcons.find((src) => !BAD_SRCS[src]) === undefined &&
        address !== undefined &&
        metaEntry === undefined &&
        metaManager !== undefined
      ) {
        metaManager?.getEntry(address ?? '0').then((entry) => {
          setMetaEntry(getMultihashFromContractResponse(entry) ?? '')
        })
      }

      setCurrent(tokenListIcons.find((src) => !BAD_SRCS[src]))
      setFallbackSrcs(tokenListIcons)
    } else {
      setCurrent(fallbackSrcs.find((src) => !BAD_SRCS[src]))
    }
  }, [current, fallbackSrcs, address, chainId, backupImg])

  return [current, nextSrc]
}
