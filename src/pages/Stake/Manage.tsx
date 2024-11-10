import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Badge from 'components/Badge'
import { ButtonGreySmall } from 'components/Button'
import { DarkGrayCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import IncentiveInfoBar from 'components/earn/IncentiveInfoBar'
import PositionManageCard from 'components/earn/PositionManageCard'
import Loader from 'components/Loader'
import { RowBetween, RowFixed } from 'components/Row'
import { Incentive, useIncentivesForPool } from 'hooks/incentives/useAllIncentives'
import { usePoolsByAddresses } from 'hooks/usePools'
import { useV3PositionsForPool, useV3StakerPositionsForPool } from 'hooks/useV3Positions'
import { LoadingRows } from 'pages/Pool/styleds'
import { useMemo, useState } from 'react'
import { AlertCircle } from 'react-feather'
import { Link, useParams } from 'react-router-dom'
import styled, { useTheme } from 'styled-components/macro'
import { HoverText, ThemedText } from 'theme'
import { formattedFeeAmount } from 'utils'
import { currencyId } from 'utils/currencyId'

import { useToken } from '../../hooks/Tokens'
import { useV3Staker } from '../../hooks/useContract'
import { PositionDetails } from '../../types/position'

const Wrapper = styled.div`
  max-width: 840px;
  width: 100%;
`
export default function Manage() {
  const { poolAddress } = useParams<{ poolAddress?: string }>()
  const { incentiveId } = useParams<{ incentiveId?: string }>()
  const [incentive, setIncentive] = useState<Incentive | undefined>()
  const theme = useTheme()
  const { account, chainId } = useWeb3React()

  const pools = usePoolsByAddresses([poolAddress])
  const [state, pool] = pools[0]
  const staker = useV3Staker()
  const currency0 = useToken(pool ? pool?.token0.address : '0x0')
  const currency1 = useToken(pool ? pool?.token1.address : '0x0')

  // all incentive programs for this pool
  const { loading, incentives } = useIncentivesForPool(poolAddress)
  //const { loading: subgraphPositionsLoading, data: subgraphPositions} = useStakedPositionsSubgraph(account ?? "")
  useMemo(() => {
    if (incentiveId && incentives) {
      setIncentive(incentives.find((i) => i.id === incentiveId))
    }
  }, [incentiveId, incentives])

  // all users positions for this pool
  const { loading: loadingPositions, inRangePositions } = useV3PositionsForPool(account, pool!)
  const { loading: loadingStakerPositions, inRangePositions: inRangeStakerPositions } = useV3StakerPositionsForPool(
    staker?.address,
    pool!,
    account
  )

  const mergeIncentive = (a: any, b: any, predicate = (a: any, b: any) => a === b) => {
    const c = [...a] // copy to avoid side effects
    // add all items from B to copy C if they're not already present
    b.forEach((bItem: any) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)))
    return c
  }

  if (!pool || !currency0 || !currency1 || loading || loadingStakerPositions || loadingPositions) {
    return (
      <Wrapper>
        <LoadingRows>
          <div />
          <div />
          <div />
        </LoadingRows>
      </Wrapper>
    )
  }

  const allPositions = mergeIncentive(inRangePositions, inRangeStakerPositions, (a, b) => a.tokenId.eq(b.tokenId))
  console.log(allPositions)
  return (
    <Wrapper>
      <AutoColumn gap="24px">
        <RowFixed>
          <ThemedText.DeprecatedBody color={theme.textTertiary} mr="4px" fontWeight={500}>
            <Link style={{ textDecoration: 'none' }} to="/stake">
              <HoverText color={theme.textTertiary}>
                <Trans>Stake</Trans>
              </HoverText>
            </Link>
          </ThemedText.DeprecatedBody>
          <ThemedText.DeprecatedBody color={theme.textTertiary} fontWeight={500}>
            {` >  ${currency0.symbol} / ${currency1.symbol} ${formattedFeeAmount(pool.fee)}%`}
          </ThemedText.DeprecatedBody>
        </RowFixed>
        <RowBetween>
          <RowFixed>
            <DoubleCurrencyLogo margin={true} currency0={currency0} currency1={currency1} size={24} />
            <ThemedText.DeprecatedBody fontWeight={600} fontSize="24px" m="0 8px">
              {`${currency0.symbol} / ${currency1.symbol} Pool`}
            </ThemedText.DeprecatedBody>
            <Badge>{formattedFeeAmount(pool.fee)}%</Badge>
          </RowFixed>
          <RowFixed>
            {chainId === 1 ? (
              <ButtonGreySmall>
                <Trans>View Analytics ↗</Trans>
              </ButtonGreySmall>
            ) : null}
            <ButtonGreySmall
              style={{ marginLeft: '8px' }}
              as={Link}
              to={`/add/${currencyId(currency0)}/${currencyId(currency1)}/${pool.fee}`}
            >
              <Trans>Add Liquidity</Trans>
            </ButtonGreySmall>
          </RowFixed>
        </RowBetween>
        {!incentives || !incentive ? (
          <ThemedText.DeprecatedBody>No incentives on this pool yet </ThemedText.DeprecatedBody>
        ) : (
          <DarkGrayCard key={incentive.poolAddress} padding="24px">
            <IncentiveInfoBar incentive={incentive} expanded={true} />
          </DarkGrayCard>
        )}
        <AutoColumn gap="16px">
          <ThemedText.DeprecatedBody fontWeight={600} fontSize="18px">
            <Trans>Your Positions</Trans>
          </ThemedText.DeprecatedBody>

          {loadingPositions ? (
            <Loader />
          ) : !allPositions ? (
            <ThemedText.DeprecatedBody>No positions on this pool</ThemedText.DeprecatedBody>
          ) : (
            (allPositions as PositionDetails[]).map((p, i) => (
              <PositionManageCard key={'position-manage-' + i} positionDetails={p} incentive={incentive} />
            ))
          )}
        </AutoColumn>
        <DarkGrayCard>
          <RowBetween>
            <AlertCircle size={32} />
            <ThemedText.DeprecatedBody ml="8px" fontSize="12px">
              <Trans>
                Boosting liquidity deposits your liquidity in the Physica Liquidity mining contracts. When boosted, your
                liquidity will continue to earn fees while in range. You must remove boosts to be able to claim fees or
                withdraw liquidity.
              </Trans>
            </ThemedText.DeprecatedBody>
          </RowBetween>
        </DarkGrayCard>
      </AutoColumn>
    </Wrapper>
  )
}
