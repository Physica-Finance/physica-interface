import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Badge, { BlueBadge, GreenBadge } from 'components/Badge'
import { ButtonSmall } from 'components/Button'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RowFixed } from 'components/Row'
import { BIG_INT_SECONDS_IN_WEEK } from 'constants/misc'
import { BigNumber } from 'ethers'
import { usePoolsByAddresses } from 'hooks/usePools'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import { useV3PositionsForPool } from 'hooks/useV3Positions'
import { LoadingRows } from 'pages/Pool/styleds'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formattedFeeAmount } from 'utils'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { unwrappedToken } from 'utils/unwrappedToken'

import { Incentive } from '../../hooks/incentives/useAllIncentives'
import { CardNoise, CardWrapper, LightCardWrapper } from './styled'
import { OverviewGrid } from './styled'
import { useCurrency } from '../../hooks/Tokens'

interface ProgramCardProps {
  poolAddress: string
  incentives: Incentive[] // will be set at 1 incentive while UNI incentives only
  hideStake?: boolean // hide stake button on manage page
}
const ExtentsText = styled.span`
  color: ${({ theme }) => theme.textPrimary};
  font-size: 14px;
  margin-right: 4px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    display: none;
  `};
`
// Overview all all incentive programs for a given pool
export default function ProgramCard({ poolAddress, incentives }: ProgramCardProps) {
  const theme = useTheme()
  const { account } = useWeb3React()
  const [, pool] = usePoolsByAddresses([poolAddress])[0]

  const currency0 = pool ? useCurrency(pool.token0.address) : undefined
  const currency1 = pool ? useCurrency(pool.token1.address) : undefined


  const { inRangePositions } = useV3PositionsForPool(account, pool!)

  const [amountBoosted, amountAvailable] = useMemo(() => {
    if (!inRangePositions) {
      return [0, 0]
    }
    // loop through all stakes - count # where liquidity is > 0
    return inRangePositions.reduce(
      (accum, position) => {
        position.stakes.map((stake) => {
          if (incentives.includes(stake.incentive) && stake.liquidity.gt(BigNumber.from(0))) {
            accum[0]++
          } else {
            accum[1]++
          }
        })
        return accum
      },
      [0, 0]
    )
  }, [incentives, inRangePositions])

  /**
   * @todo
   */
  const rewardCurrency = incentives[0].initialRewardAmount.currency
  const activeLiquidity = incentives[0].initialRewardAmount
  const activeLiquidityUSD = useStablecoinValue(activeLiquidity)
  const rewardPerDay = incentives[0].rewardRatePerSecond.multiply(BIG_INT_SECONDS_IN_WEEK)

  return (
    <LightCardWrapper>
    <CardNoise />
      {!pool || !currency0 || !currency1 ? (
        <LoadingRows>
          <div />
        </LoadingRows>
      ) : (
        <OverviewGrid>
          <RowFixed justifySelf="flex-start">
            <DoubleCurrencyLogo margin={true} currency0={currency0} currency1={currency1} size={20} />
            <ThemedText.DeprecatedBody fontWeight={600} fontSize="20px" m="0 8px">
              {`${currency0.symbol} / ${currency1.symbol}`}
            </ThemedText.DeprecatedBody>
            <Badge>{formattedFeeAmount(pool.fee)}%</Badge>
            <RowFixed>
              {amountBoosted > 0 ? (
                <BlueBadge>
                  <ThemedText.DeprecatedBody fontWeight={700} fontSize="12px" color={theme.deprecated_blue4}>
                    {amountBoosted} <Trans>Boosted</Trans>
                  </ThemedText.DeprecatedBody>
                </BlueBadge>
              ) : null}
              {amountAvailable > 0 ? (
                <GreenBadge style={{ marginLeft: '8px' }}>
                  <ThemedText.DeprecatedBody fontWeight={700} fontSize="12px" color={theme.deprecated_yellow2}>
                    {amountAvailable} <Trans>Available</Trans>
                  </ThemedText.DeprecatedBody>
                </GreenBadge>
              ) : null}
            </RowFixed>
          </RowFixed>
          <ExtentsText>
            {activeLiquidityUSD
              ? `$${formatCurrencyAmount(activeLiquidityUSD, 2)}`
              : `${formatCurrencyAmount(activeLiquidity, 4)} ${rewardCurrency.symbol}`}
          </ExtentsText>
          <RowFixed>
            <CurrencyLogo currency={rewardCurrency} size="16px" />
            <ExtentsText>{`${formatCurrencyAmount(rewardPerDay, 4)} ${
              rewardCurrency.symbol
            } / day`}</ExtentsText>
          </RowFixed>
          <ButtonSmall as={Link} to={'/stake/' + poolAddress}>
            <Trans>Manage</Trans>
          </ButtonSmall>
        </OverviewGrid>
      )}
    </LightCardWrapper>
  )
}
