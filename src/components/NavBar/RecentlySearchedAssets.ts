import { SupportedChainId } from 'constants/chains'
import { NATIVE_CHAIN_ID, nativeOnChain } from 'constants/tokens'
import { Chain, NftCollection, useRecentlySearchedAssetsQuery } from 'graphql/data/__generated__/types-and-hooks'
import { SearchToken } from 'graphql/thegraph/SearchTokens'
import { CHAIN_NAME_TO_CHAIN_ID } from 'graphql/data/util'
import { useAtom } from 'jotai'
import { atomWithStorage, useAtomValue } from 'jotai/utils'
import { GenieCollection } from 'nft/types'
import { useCallback, useMemo } from 'react'
import { getNativeTokenDBAddress } from 'utils/nativeTokens'

type RecentlySearchedAsset = {
  isNft?: boolean
  address: string
  chain: Chain
}

// Temporary measure used until backend supports addressing by "NATIVE"
const NATIVE_QUERY_ADDRESS_INPUT = null as unknown as string
function getQueryAddress(chain: Chain) {
  return getNativeTokenDBAddress(chain) ?? NATIVE_QUERY_ADDRESS_INPUT
}

const recentlySearchedAssetsAtom = atomWithStorage<RecentlySearchedAsset[]>('recentlySearchedAssets', [])

export function useAddRecentlySearchedAsset() {
  const [searchHistory, updateSearchHistory] = useAtom(recentlySearchedAssetsAtom)

  return useCallback(
    (asset: RecentlySearchedAsset) => {
      // Removes the new asset if it was already in the array
      const newHistory = searchHistory.filter(
        (oldAsset) => !(oldAsset.address === asset.address && oldAsset.chain === asset.chain)
      )
      newHistory.unshift(asset)
      updateSearchHistory(newHistory)
    },
    [searchHistory, updateSearchHistory]
  )
}

export function useRecentlySearchedAssets() {
  const history = useAtomValue(recentlySearchedAssetsAtom)
  const shortenedHistory = useMemo(() => history.slice(0, 4), [history])

  const { data: queryData, loading } = useRecentlySearchedAssetsQuery({
    variables: {
      collectionAddresses: shortenedHistory.filter((asset) => asset.isNft).map((asset) => asset.address),
      contracts: shortenedHistory
        .filter((asset) => !asset.isNft)
        .map((token) => ({
          address: token.address === NATIVE_CHAIN_ID ? getQueryAddress(token.chain) : token.address,
          chain: token.chain,
        })),
    },
  })

  const data = useMemo(() => {
    if (shortenedHistory.length === 0) return []
    else if (!queryData) return undefined
    // Collects both tokens and collections in a map, so they can later be returned in original order
    const resultsMap: { [key: string]: SearchToken } = {}

    queryData.tokens?.filter(Boolean).forEach((token) => {
      resultsMap[token.id ?? `NATIVE-7070`] = token
    })

    const data: (SearchToken)[] = []
    shortenedHistory.forEach((asset) => {
        const result = resultsMap[asset.address]
        if (result) data.push(result)
    })
    return data
  }, [queryData, shortenedHistory])

  return { data, loading }
}
