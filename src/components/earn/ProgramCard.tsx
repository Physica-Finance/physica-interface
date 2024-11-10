import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Badge from 'components/Badge'
import { ButtonSmall } from 'components/Button'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RowFixed } from 'components/Row'
import { BIG_INT_SECONDS_IN_DAY, BIG_INT_SECONDS_IN_WEEK } from 'constants/misc'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import { LoadingRows } from 'pages/Pool/styleds'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { formattedFeeAmount } from 'utils'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { Incentive } from '../../hooks/incentives/useAllIncentives'
import { useCurrency, useToken } from '../../hooks/Tokens'
import { CardNoise, LightCardWrapper } from './styled'
import { OverviewGrid } from './styled'

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

function IncentiveRow(incentive: Incentive, poolAddress: string) {
  const theme = useTheme()

  const currency0 = useCurrency(incentive.pool.token0.address)
  const currency1 = useCurrency(incentive.pool.token1.address)
  const rewardCurrency = useToken(incentive.initialRewardAmount.currency.address)
  const activeLiquidity = incentive.initialRewardAmount
  const activeLiquidityUSD = useStablecoinValue(activeLiquidity)
  const rewardPerDay = incentive.rewardRatePerSecond.multiply(BIG_INT_SECONDS_IN_DAY)

  return (
    <LightCardWrapper>
      <CardNoise />
      {!currency0 || !currency1 || !rewardCurrency ? (
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
            <Badge>{formattedFeeAmount(incentive.pool.fee)}%</Badge>
          </RowFixed>
          <ExtentsText>
            {activeLiquidityUSD
              ? `$${formatCurrencyAmount(activeLiquidityUSD, 2)}`
              : `${formatCurrencyAmount(activeLiquidity, 4)} ${rewardCurrency.symbol}`}
          </ExtentsText>
          <RowFixed>
            <CurrencyLogo currency={rewardCurrency} size="16px" />
            <ExtentsText>{`${formatCurrencyAmount(rewardPerDay, 4)} ${rewardCurrency.symbol} / day`}</ExtentsText>
          </RowFixed>
          <ButtonSmall as={Link} to={'/stake/' + incentive.poolAddress + '/' + incentive.id}>
            <Trans>Manage</Trans>
          </ButtonSmall>
        </OverviewGrid>
      )}
    </LightCardWrapper>
  )
}

/*
 <ExtentsText>
        {activeLiquidityUSD
          ? `$${formatCurrencyAmount(activeLiquidityUSD, 2)}`
          : `${formatCurrencyAmount(activeLiquidity, 4)} ${rewardCurrency.symbol}`}
      </ExtentsText>
 */

// Overview all all incentive programs for a given pool
export default function ProgramCard({ poolAddress, incentives }: ProgramCardProps) {
  const theme = useTheme()
  const { account } = useWeb3React()

  /**
   * @todo
   */
  const rewardCurrency = incentives[0].initialRewardAmount.currency
  const activeLiquidity = incentives[0].initialRewardAmount
  const activeLiquidityUSD = useStablecoinValue(activeLiquidity)
  const rewardPerDay = incentives[0].rewardRatePerSecond.multiply(BIG_INT_SECONDS_IN_WEEK)

  return (
    <>
      {incentives.map((incentive: Incentive) => (
        <IncentiveRow
          key={incentive.id}
          incentive={incentive}
          poolAddress={poolAddress}
          endTime={incentive.endTime}
          id={incentive.id}
          initialRewardAmount={incentive.initialRewardAmount}
          pool={incentive.pool}
          refundee={incentive.refundee}
          rewardAmountRemaining={incentive.rewardAmountRemaining}
          rewardRatePerSecond={incentive.rewardRatePerSecond}
          startTime={incentive.startTime}
        />
      ))}
    </>
  )
}
