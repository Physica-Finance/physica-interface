import gql from 'graphql-tag'
import { useMemo } from 'react'

import { chainIdToBackendName, unwrapToken } from './util'
import { useQuery } from '@apollo/client'
import { apolloClient } from '../thegraph/apollo'

export const TRENDING_POOLS_QUERY = gql`
query TrendingPool2 {
  pools(first: 100, orderBy: volumeUSD, orderDirection: desc) {
    liquidity
    token0 {
      decimals
      id
      name
      symbol
    }
    token1 {
      decimals
      id
      name
      symbol
    }
    token0Price
    token1Price
    totalValueLockedToken0
    totalValueLockedToken1
    totalValueLockedUSD
    volumeUSD
    feeTier
    id
  }
}
`
export type PoolQuery2 = {
  __typename?: 'Query'
  pools?: Array<{
    __typename?: 'Token'
    id: string
    liquidity?: string
    token0Price: string,
    token1Price: string,
    totalValueLockedToken0: string,
    totalValueLockedToken1: string,
    totalValueLockedUSD: string,
    volumeUSD: string,
    feeTier: string,
    token0: { __typename?: 'Token'; id: string; decimals: string; name: string; symbole: string; }
    token1: { __typename?: 'Token'; id: string; decimals: string; name: string; symbole: string; }
  }>
}

export type PoolQueryData2 = PoolQuery2['pools']

export default function useTrendingPools2(chainId?: number) {
  const chain = chainIdToBackendName(chainId)
  const { data, loading } = useQuery(TRENDING_POOLS_QUERY, { client: apolloClient })

  return useMemo(
    () => ({ data: data?.pools, loading }),
    [chainId, data?.pools, loading]
  )
}
