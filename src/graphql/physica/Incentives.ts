import { gql, useQuery } from '@apollo/client'
import { apolloClient } from './incentivesApollo'
import { useMemo } from 'react'

const ALL_INCENTIVES_QUERY = gql`
  query AllIncentives {
    incentives {
      id
      pool
      reward
      rewardToken
      startTime
      refundee
      endTime
      ended
    }
  }
`

const ALL_INCENTIVES_BY_POOL_QUERY = gql`
  query AllIncentivesByPool($id: String!) {
    incentives(where: { pool: $id }) {
      id
      pool
      reward
      rewardToken
      startTime
      refundee
      endTime
      ended
    }
  }
`

const STAKED_POSTISIONS_QUERY = gql`
  query StakedPositions($owner: String!) {
    positions(where: { owner: $owner, and: { staked: true } }) {
      tokenId
      staked
      owner
      id
      liquidity
      oldOwner
    }
  }
`

export type AllIncentivesQuery2 = {
  __typename?: 'Query'
  incentives?: Array<{
    __typename?: 'Incentive'
    id: string
    pool: string
    reward: string
    rewardToken: string
    startTime: string
    refundee: string
    endTime: string
    ended: boolean
  }>
}

export type StakedPositionsQuery2 = {
  __typename?: 'Query'
  positions?: Array<{
    __typename?: 'Incentive'
    tokenId: string
    staked: boolean
    owner: string
    id: string
    liquidity: string
    oldOwner?: string
  }>
}

export type AllIncentivesData2 = AllIncentivesQuery2['incentives']
export type StakedPositionsData2 = StakedPositionsQuery2['positions']

export function useStakedPositionsSubgraph(owner: string) {
  const { data, loading } = useQuery(STAKED_POSTISIONS_QUERY, { client: apolloClient, variables: { owner } })

  return useMemo(() => ({ data: data?.positions, loading }), [data?.positions, loading])
}

export default function useAllIncentivesSubgraph(poolId?: string) {
  if (poolId) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, loading } = useQuery(ALL_INCENTIVES_BY_POOL_QUERY, {
      client: apolloClient,
      variables: { id: poolId },
    })
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(() => ({ data: data?.incentives, loading }), [data?.incentives, loading])
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, loading } = useQuery(ALL_INCENTIVES_QUERY, { client: apolloClient })

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo(() => ({ data: data?.incentives, loading }), [data?.incentives, loading])
}
