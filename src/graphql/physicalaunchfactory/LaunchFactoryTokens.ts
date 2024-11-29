import {
  filterStringAtom,
  filterTimeAtom,
  sortAscendingAtom,
  sortMethodAtom,
  TokenSortMethod,
} from 'components/LaunchFactory/state'
import gql from 'graphql-tag'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'

import { Chain } from '../data/__generated__/types-and-hooks'
import {
  CHAIN_NAME_TO_CHAIN_ID, isLaunchFactoryPricePoint,
  isPricePoint, LaunchFactoryPricePoint,
  PollingInterval,
  PricePoint,
  toHistoryDuration,
  unwrapToken,
  usePollQueryWhileMounted
} from '../physica/util'
import { TokenQuery2, TRENDING_TOKENS_QUERY } from '../physica/TrendingTokens'
import { QueryResult, useQuery } from '@apollo/client'
import { apolloClient } from './apollo'

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

export const SPARKLINE_TOKENS_LAUNCHPAD_QUERY = gql`
  query SparklineTokenLaunchpad($duration: Int!) {
    tokens(orderBy: startTime, orderDirection: desc) {
      id
      name
      symbol
      dev
      ipfsHash
      initialSupply
      migrationCap
      plqAmount
      startTime
      tokenAmount
      migrated
      txCount
      txs(orderDirection: asc, orderBy: timestamp, where: { timestamp_gt: $duration }) {
        id
        plqAmount
        price
        tokenAmount
        timestamp
        from
      }
    }
  }
`

export const LAUNCHPAD_TOKENS_QUERY = gql`
    query LaunchpadTokens {
        tokens(orderBy: startTime, orderDirection: desc) {
            id
            name
            symbol
            dev
            ipfsHash
            initialSupply
            migrationCap
            plqAmount
            startTime
            tokenAmount
            migrated
            txCount
            txs(orderDirection: asc, orderBy: timestamp) {
                id
                plqAmount
                price
                tokenAmount
                timestamp
                buy
                from
            }
        }
    }
`
export type LaunchpadTokenQuery = {
  __typename?: 'Query'
  tokens?: Array<{
    __typename?: 'Token'
    id: string
    name?: string
    symbol?: string
    dev?: string
    ipfsHash?: string
    initialSupply?: string
    migrationCap?: string
    plqAmount?: string
    startTime?: string
    tokenAmount?: string
    txCount?: string
    migrated?: boolean
    txs?: Array<{
      __typename?: 'TokenMarket'
      id: string
      plqAmount?: string
      price?: string
      tokenAmount?: string
      from?: string
      buy?: boolean
      timestamp: number
    }>
  }>
}

function useSortedTokens(tokens: LaunchpadTokenQuery['tokens']) {
  const sortMethod = useAtomValue(sortMethodAtom)
  const sortAscending = useAtomValue(sortAscendingAtom)

  return useMemo(() => {
    if (!tokens) return undefined
    let tokenArray = Array.from(tokens)
    switch (sortMethod) {
      case TokenSortMethod.PRICE:
        tokenArray = tokenArray.sort(
          (a, b) => parseFloat(b?.txs![0].price ?? '0') - parseFloat(a?.txs![0].price ?? '0')
        )
        break
      case TokenSortMethod.CREATOR:
        tokenArray = tokenArray.sort((a, b) => b?.dev?.localeCompare(a?.dev ?? '') ?? 0)
        break
      case TokenSortMethod.TOTAL_VALUE_LOCKED:
        tokenArray = tokenArray.sort(
          (a, b) => parseFloat(b?.plqAmount ?? '0') - parseFloat(a?.plqAmount ?? '0')
        )
        break
      case TokenSortMethod.TXS:
        tokenArray = tokenArray.sort((a, b) => parseFloat(b?.txCount ?? '0') - parseFloat(a?.txCount ?? '0'))
        break
    }

    return sortAscending ? tokenArray.reverse() : tokenArray
  }, [tokens, sortMethod, sortAscending])
}

function useFilteredTokens(tokens: LaunchpadTokenQuery['tokens']) {
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
export type SparklineMap = { [key: string]: LaunchFactoryPricePoint[] | undefined }
export type LaunchpadToken = NonNullable<NonNullable<LaunchpadTokenQuery>['tokens']>[number]

interface UseTopTokensReturnValue {
  tokens: LaunchpadToken[] | undefined
  tokenSortRank: Record<string, number>
  loadingTokens: boolean
  sparklines: SparklineMap
}

export function useLachfactoryTokens(chain: Chain): UseTopTokensReturnValue {
  const chainId = CHAIN_NAME_TO_CHAIN_ID[chain]
  const duration = toHistoryDuration(useAtomValue(filterTimeAtom))

  const { data: sparklineQuery } = usePollQueryWhileMounted(
    useQuery(SPARKLINE_TOKENS_LAUNCHPAD_QUERY, {
      variables: { duration: Math.floor(Date.now() / 1000 - 86400 * 30) },
      client: apolloClient,
      // eslint-disable-next-line @typescript-eslint/ban-types
    }) as QueryResult<LaunchpadTokenQuery, { duration: number }>,
    PollingInterval.Slow
  )

  const sparklines = useMemo(() => {
    const unwrappedTokens = sparklineQuery?.tokens?.map((topToken) => unwrapToken(chainId, topToken))
    const map: SparklineMap = {}
    unwrappedTokens?.forEach(
      (current) =>
        current?.id &&
        ((map[current.id] = current?.txs?.filter(isLaunchFactoryPricePoint)))
    )
    return map
  }, [chainId, sparklineQuery?.tokens])

  const { data, loading: loadingTokens } = usePollQueryWhileMounted(
    useQuery(LAUNCHPAD_TOKENS_QUERY, {
      variables: {},
      client: apolloClient,
      // eslint-disable-next-line @typescript-eslint/ban-types
    }) as QueryResult<LaunchpadTokenQuery, {}>,
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
