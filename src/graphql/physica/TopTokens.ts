import {
  filterStringAtom,
  filterTimeAtom,
  sortAscendingAtom,
  sortMethodAtom,
  TokenSortMethod,
} from 'components/Tokens/state'
import gql from 'graphql-tag'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'

import { Chain } from '../data/__generated__/types-and-hooks'
import {
  CHAIN_NAME_TO_CHAIN_ID,
  isPricePoint,
  PollingInterval,
  PricePoint,
  toHistoryDuration,
  unwrapToken,
  usePollQueryWhileMounted,
} from './util'
import { TokenQuery2, TRENDING_TOKENS_QUERY } from './TrendingTokens'
import { QueryResult, useQuery } from '@apollo/client'
import { apolloClient } from '../thegraph/apollo'

// tokenDayDatas(orderBy: volumeUSD, orderDirection: desc) {
//     priceUSD
//     open
//     high
//     close
//     token {
//       name
//       symbol
//       derivedETH
//       decimals
//       id
//     }
//     volumeUSD
//   }

gql`
  query TopTokens100($duration: HistoryDuration!, $chain: Chain!) {
    topTokens(pageSize: 100, page: 1, chain: $chain, orderBy: VOLUME) {
      id
      name
      chain
      address
      symbol
      standard
      market(currency: USD) {
        id
        totalValueLocked {
          id
          value
          currency
        }
        price {
          id
          value
          currency
        }
        pricePercentChange(duration: $duration) {
          id
          currency
          value
        }
        volume(duration: $duration) {
          id
          value
          currency
        }
      }
      project {
        id
        logoUrl
      }
    }
  }
`

gql`
  query TopTokensSparkline($duration: HistoryDuration!, $chain: Chain!) {
    topTokens(pageSize: 100, page: 1, chain: $chain) {
      id
      address
      chain
      market(currency: USD) {
        id
        priceHistory(duration: $duration) {
          id
          timestamp
          value
        }
      }
    }
  }
`

export const SPARKLINE_TOKENS_QUERY = gql`
  query SparklineToken2 {
    tokens(orderBy: volumeUSD) {
      id
      name
      symbol
      volumeUSD
      totalValueLockedUSD
      totalSupply
      tokenDayData(first: 100, orderDirection: desc, orderBy: date) {
        priceUSD
        date
        id
        open
      }
      decimals
    }
  }
`

function useSortedTokens(tokens: TokenQuery2['tokens']) {
  const sortMethod = useAtomValue(sortMethodAtom)
  const sortAscending = useAtomValue(sortAscendingAtom)

  return useMemo(() => {
    if (!tokens) return undefined
    let tokenArray = Array.from(tokens)
    switch (sortMethod) {
      case TokenSortMethod.PRICE:
        tokenArray = tokenArray.sort(
          (a, b) => parseFloat(b?.tokenDayData![0].priceUSD ?? '0') - parseFloat(a?.tokenDayData![0].priceUSD ?? '0')
        )
        break
      case TokenSortMethod.PERCENT_CHANGE:
        tokenArray = tokenArray.sort(
          (a, b) =>
            parseFloat(b?.tokenDayData![0].open ?? '0') -
            parseFloat(b?.tokenDayData![0].priceUSD ?? '0') -
            (parseFloat(a?.tokenDayData![0].open ?? '0') - parseFloat(a?.tokenDayData![0].priceUSD ?? '0'))
        )
        break
      case TokenSortMethod.TOTAL_VALUE_LOCKED:
        tokenArray = tokenArray.sort(
          (a, b) => parseFloat(b?.totalValueLockedUSD ?? '0') - parseFloat(a?.totalValueLockedUSD ?? '0')
        )
        break
      case TokenSortMethod.VOLUME:
        tokenArray = tokenArray.sort((a, b) => parseFloat(b?.volumeUSD ?? '0') - parseFloat(a?.volumeUSD ?? '0'))
        break
    }

    return sortAscending ? tokenArray.reverse() : tokenArray
  }, [tokens, sortMethod, sortAscending])
}

function useFilteredTokens(tokens: TokenQuery2['tokens']) {
  const filterString = useAtomValue(filterStringAtom)

  const lowercaseFilterString = useMemo(() => filterString.toLowerCase(), [filterString])

  return useMemo(() => {
    if (!tokens) return undefined
    let returnTokens = tokens
    if (lowercaseFilterString) {
      returnTokens = returnTokens?.filter((token) => {
        const addressIncludesFilterString = token?.id?.toLowerCase().includes(lowercaseFilterString)
        const nameIncludesFilterString = token?.name?.toLowerCase().includes(lowercaseFilterString)
        const symbolIncludesFilterString = token?.symbol?.toLowerCase().includes(lowercaseFilterString)
        return nameIncludesFilterString || symbolIncludesFilterString || addressIncludesFilterString
      })
    }
    return returnTokens
  }, [tokens, lowercaseFilterString])
}

// Number of items to render in each fetch in infinite scroll.
export const PAGE_SIZE = 20
export type SparklineMap = { [key: string]: PricePoint[] | undefined }
export type TopToken = NonNullable<NonNullable<TokenQuery2>['tokens']>[number]

interface UseTopTokensReturnValue {
  tokens: TopToken[] | undefined
  tokenSortRank: Record<string, number>
  loadingTokens: boolean
  sparklines: SparklineMap
}

export function useTopTokens2(chain: Chain): UseTopTokensReturnValue {
  const chainId = CHAIN_NAME_TO_CHAIN_ID[chain]
  const duration = toHistoryDuration(useAtomValue(filterTimeAtom))

  const { data: sparklineQuery } = usePollQueryWhileMounted(
    useQuery(SPARKLINE_TOKENS_QUERY, {
      variables: {},
      client: apolloClient,
      // eslint-disable-next-line @typescript-eslint/ban-types
    }) as QueryResult<TokenQuery2, {}>,
    PollingInterval.Slow
  )

  const sparklines = useMemo(() => {
    const unwrappedTokens = sparklineQuery?.tokens?.map((topToken) => unwrapToken(chainId, topToken))
    const map: SparklineMap = {}
    unwrappedTokens?.forEach(
      (current) => current?.id && (map[current.id] = current?.tokenDayData?.filter(isPricePoint))
    )
    return map
  }, [chainId, sparklineQuery?.tokens])

  const { data, loading: loadingTokens } = usePollQueryWhileMounted(
    useQuery(TRENDING_TOKENS_QUERY, {
      variables: {},
      client: apolloClient,
      // eslint-disable-next-line @typescript-eslint/ban-types
    }) as QueryResult<TokenQuery2, {}>,
    PollingInterval.Fast
  )

  const unwrappedTokens = useMemo(() => data?.tokens?.map((token) => unwrapToken(chainId, token)), [chainId, data])
  const sortedTokens = useSortedTokens(unwrappedTokens)
  const tokenSortRank = useMemo(
    () =>
      sortedTokens?.reduce((acc, cur, i) => {
        if (!cur.id) return acc
        return {
          ...acc,
          [cur.id]: i + 1,
        }
      }, {}) ?? {},
    [sortedTokens]
  )
  const filteredTokens = useFilteredTokens(sortedTokens)
  return useMemo(
    () => ({ tokens: filteredTokens, tokenSortRank, loadingTokens, sparklines }),
    [filteredTokens, tokenSortRank, loadingTokens, sparklines]
  )
}
