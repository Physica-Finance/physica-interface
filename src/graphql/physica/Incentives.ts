import { gql, useQuery } from '@apollo/client'
import { chainIdToBackendName } from './util'
import { apolloClient } from './incentivesApollo'
import { useMemo } from 'react'
import { TRENDING_POOLS_QUERY } from './TrendingPools'

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
        incentives(where: {pool: $id}) {
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

export type AllIncentivesData2 = AllIncentivesQuery2['incentives']

export default function useAllIncentivesSubgraph(poolId?: string) {
  if(poolId) {
    const { data, loading } = useQuery(ALL_INCENTIVES_BY_POOL_QUERY, { client: apolloClient, variables: { id: poolId } })
    return useMemo(
      () => ({ data: data?.incentives, loading }),
      [data?.incentives, loading]
    )
  }

  const { data, loading } = useQuery(ALL_INCENTIVES_QUERY, { client: apolloClient })

  return useMemo(
    () => ({ data: data?.incentives, loading }),
    [data?.incentives, loading]
  )
}
