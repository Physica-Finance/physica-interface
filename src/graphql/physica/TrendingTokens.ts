import gql from 'graphql-tag'
import { useMemo } from 'react'

import { chainIdToBackendName, unwrapToken } from './util'
import { useQuery } from '@apollo/client'
import { apolloClient } from '../thegraph/apollo'

export const TRENDING_TOKENS_QUERY = gql`
query TrendingToken2 {
    tokens(orderBy: volumeUSD) {
      id
      name
      symbol
      volumeUSD
      totalValueLockedUSD
      totalSupply
      tokenDayData(first: 1, orderDirection: desc, orderBy: date) {
        priceUSD
        date
        id
        open
      }
      decimals
    }
  }
`
export type TokenQuery2 = {
  __typename?: 'Query'
  tokens?: Array<{
    __typename?: 'Token'
    id: string
    decimals?: number
    name?: string
    symbol?: string
    volumeUSD?: string
    totalValueLockedUSD?: string
    totalSupply?: string
    tokenDayData?: Array<{ __typename?: 'TokenMarket'; id: string; priceUSD?: string; open?: string; date: number }>
  }>
}

export type TokenQueryData2 = TokenQuery2['tokens']

export default function useTrendingTokens2(chainId?: number) {
  const chain = chainIdToBackendName(chainId)
  const { data, loading } = useQuery(TRENDING_TOKENS_QUERY, { client: apolloClient })

  return useMemo(
    () => ({ data: data?.topTokens?.map((token: any) => unwrapToken(chainId ?? 7070, token)), loading }),
    [chainId, data?.topTokens, loading]
  )
}
