import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import { useSingleContractMultipleData } from 'lib/hooks/multicall'
import { useMemo, useRef, useState } from 'react'

import useAllIncentivesSubgraph from '../../graphql/physica/Incentives'
import { useAllTokens, useToken } from '../Tokens'
import { useV3Staker } from '../useContract'
import { PoolState, usePoolsByAddresses } from '../usePools'
import { incentiveKeyToIncentiveId } from './incentiveKeyToIncentiveId'

export interface Incentive {
  id: string
  pool: Pool
  poolAddress: string
  startTime: number
  endTime: number
  initialRewardAmount: CurrencyAmount<Token>
  rewardAmountRemaining: CurrencyAmount<Token>
  rewardRatePerSecond: CurrencyAmount<Token>
  refundee: string
}

export function useAllIncentives(): {
  loading: boolean
  incentives?: Incentive[]
} {
  const staker = useV3Staker()
  const { loading: loading, data: subgraphIncentives } = useAllIncentivesSubgraph()
  const [incentiveIds, setIncentiveIds] = useState<string[][]>([])
  const [poolAddresses, setPoolAddresses] = useState<string[]>([])
  const [tokenAddresses, setTokenAddresses] = useState<string[]>([])

  useMemo(() => {
    if (!loading && subgraphIncentives) {
      for (let i = 0; i < subgraphIncentives.length; i++) {
        setIncentiveIds([...incentiveIds, [subgraphIncentives[i].id]])
        setPoolAddresses([...poolAddresses, subgraphIncentives[i].pool])
        setTokenAddresses([...tokenAddresses, subgraphIncentives[i].rewardToken])
      }
    }
  }, [loading, subgraphIncentives])

  /*const filter = useMemo(() => staker?.filters?.IncentiveCreated(), [staker])
  const { logs } = useLogs(filter)

  const parsedLogs = useMemo(() => {
    if (!staker || !subgraphIncentives) return undefined
    const fragment = staker.interface.events['IncentiveCreated(address,address,uint256,uint256,address,uint256)']
    return logs?.map((logs) => staker.interface.decodeEventLog(fragment, logs.data, logs.topics))
  }, [logs, staker, subgraphIncentives])*/

  /*const incentiveIds = useMemo(() => {
    return parsedLogs?.map((log) => [incentiveKeyToIncentiveId(log)]) ?? []
  }, [parsedLogs])*/

  const incentiveStates = useSingleContractMultipleData(staker, 'incentives', incentiveIds)

  // returns all the token addresses for which there are incentives
  // const tokenAddresses = useMemo(() => {
  //   return Object.keys(
  //     parsedLogs?.reduce<{ [tokenAddress: string]: true }>((memo, value) => {
  //       memo[value.rewardToken] = true
  //       return memo
  //     }, {}) ?? {}
  //   )
  // }, [parsedLogs])

  /*const poolAddresses = useMemo(() => {
    return Object.keys(
      parsedLogs?.reduce<{ [poolAddress: string]: true }>((memo, value) => {
        if (value.pool) memo[value.pool] = true
        return memo
      }, {}) ?? {}
    )
  }, [parsedLogs])*/

  const pools = usePoolsByAddresses(poolAddresses)

  const poolMap = useMemo(() => {
    return poolAddresses.reduce<{ [poolAddress: string]: [PoolState, Pool | null] }>((memo, address, ix) => {
      memo[address] = pools[ix]
      return memo
    }, {})
  }, [subgraphIncentives, pools])

  const allTokens = useAllTokens()

  return useMemo(() => {
    if (loading || !pools || !subgraphIncentives || incentiveStates.some((s) => s.loading)) return { loading: true }

    return {
      loading: false,
      incentives: subgraphIncentives
        .map((result: any, ix: number): Incentive | null => {
          let token = new Token(
            7070,
            result.rewardToken,
            18,
            result.rewardToken.slice(0, 6) + '...' + result.rewardToken.slice(-4)
          )

          if (allTokens[result.rewardToken]) {
            token = allTokens[result.rewardToken]
          }

          const state = incentiveStates[ix]?.result
          // todo: currently we filter out any incentives for tokens not on the active token lists
          if (!token || !state) return null
          const [, pool] = poolMap[result.pool]
          // todo: currently we filter out any incentives for pools not containing tokens on the active lists
          if (!pool) return null

          const initialRewardAmount = CurrencyAmount.fromRawAmount(token, result.reward)
          const rewardAmountRemaining = CurrencyAmount.fromRawAmount(token, state.totalRewardUnclaimed)

          const [startTime, endTime] = [parseInt(result.startTime), parseInt(result.endTime)]

          const rewardRatePerSecond = initialRewardAmount.divide(endTime - startTime)

          const refundee = result.refundee

          const id = incentiveKeyToIncentiveId({
            rewardToken: result.rewardToken,
            pool: result.pool,
            startTime,
            endTime,
            refundee,
          })

          return {
            id,
            pool,
            poolAddress: result.pool,
            startTime,
            endTime,
            initialRewardAmount,
            rewardAmountRemaining,
            rewardRatePerSecond,
            refundee,
          }
        })
        .filter((x: any): x is Incentive => x !== null),
    }
  }, [incentiveStates, poolMap])
}

/**
 * Used for getting sorted list of all incentives broken down by pool
 */
export function useAllIncentivesByPool(): {
  loading: boolean
  incentives?: {
    [poolAddress: string]: Incentive[]
  }
} {
  const { loading, incentives } = useAllIncentives()
  console.log(incentives)
  return useMemo(() => {
    if (loading) {
      return {
        loading: true,
        incentives: undefined,
      }
    }
    if (!incentives) {
      return {
        loading: false,
        incentives: undefined,
      }
    }
    return {
      loading: false,
      incentives: incentives.reduce(
        (
          accum: {
            [poolAddress: string]: Incentive[]
          },
          incentive
        ) => {
          accum[incentive.poolAddress] = [...(accum[incentive.poolAddress] ?? []), incentive]
          return accum
        },
        {}
      ),
    }
  }, [incentives, loading])
}

export function useIncentivesForPool(poolAddress?: string): {
  loading: boolean
  incentives?: Incentive[]
} {
  const { loading, incentives } = useAllIncentivesByPool()

  if (!poolAddress) {
    return {
      loading: false,
      incentives: undefined,
    }
  }

  if (loading) {
    return {
      loading: true,
      incentives: undefined,
    }
  }

  if (!incentives) {
    return {
      loading: false,
      incentives: undefined,
    }
  }

  return {
    loading: false,
    incentives: incentives[poolAddress] ?? [],
  }
}
