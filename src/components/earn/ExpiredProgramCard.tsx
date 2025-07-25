import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Badge from 'components/Badge'
import { ButtonPrimary } from 'components/Button'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { AutoRow, RowBetween } from 'components/Row'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import { useV3StakerPositionsForPool } from 'hooks/useV3Positions'
import { LoadingRows } from 'pages/Pool/styleds'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components/macro'
import { formattedFeeAmount } from 'utils'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { Incentive } from '../../hooks/incentives/useAllIncentives'
import { useCurrency } from '../../hooks/Tokens'
import { useV3Staker } from '../../hooks/useContract'
import { AutoColumn } from '../Column'
import { ThemedText } from '../../theme'

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 400;
`

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 14px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 12px;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  border-radius: 12px;
  font-size: 16px;
  padding: 6px 8px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 100%;
  `};
`

const StatsColumn = styled(AutoColumn)`
  gap: 4px;
`

interface ExpiredProgramCardProps {
  poolAddress: string
  incentives: Incentive[]
}

function ExpiredIncentiveRow({ incentive }: { incentive: Incentive }) {
  const theme = useTheme()
  const { account } = useWeb3React()
  const staker = useV3Staker()
  
  const currency0 = useCurrency(incentive.pool.token0.address)
  const currency1 = useCurrency(incentive.pool.token1.address)
  const rewardCurrency = useCurrency(incentive.initialRewardAmount.currency.address)
  
  const remainingRewards = incentive.rewardAmountRemaining
  const remainingRewardsUSD = useStablecoinValue(remainingRewards)
  
  // Get staked positions for this pool
  const { inRangePositions, outOfRangePositions, loading: loadingPositions } = useV3StakerPositionsForPool(
    staker?.address,
    incentive.pool,
    account
  )
  
  const stakedPositionsCount = (inRangePositions?.length || 0) + (outOfRangePositions?.length || 0)
  const isRefundee = account && account.toLowerCase() === incentive.refundee.toLowerCase()
  
  return (
    <AutoColumn>
      {!currency0 || !currency1 || !rewardCurrency ? (
        <LoadingRows>
          <div />
        </LoadingRows>
      ) : (
        <AutoColumn gap="md" justify={'stretch'}>
          <AutoRow padding="5px" gap="5px" justify={'stretch'} width={'100%'}>
            <DoubleCurrencyLogo margin={true} currency0={currency0} currency1={currency1} size={20} />
            <Text>
              {`${currency0.symbol} / ${currency1.symbol}`}{' '}
              <Badge>
                <BadgeText>{formattedFeeAmount(incentive.pool.fee)}%</BadgeText>
              </Badge>
            </Text>
            
            <StatsColumn align="end">
              {isRefundee && (
                <ThemedText.DeprecatedBody fontSize="12px" color={theme.deprecated_yellow2}>
                  <Trans>You created this</Trans>
                </ThemedText.DeprecatedBody>
              )}
              {!loadingPositions && stakedPositionsCount > 0 && (
                <Badge style={{ backgroundColor: theme.deprecated_warning }}>
                  <BadgeText>
                    {stakedPositionsCount} staked position{stakedPositionsCount > 1 ? 's' : ''}
                  </BadgeText>
                </Badge>
              )}
              <AutoRow gap="4px" justify="end">
                <CurrencyLogo currency={rewardCurrency} size="16px" />
                <Text style={{ margin: 0 }}>
                  {remainingRewardsUSD
                    ? `$${formatCurrencyAmount(remainingRewardsUSD, 2)}`
                    : `${formatCurrencyAmount(remainingRewards, 4)} ${rewardCurrency.symbol}`}
                  {' remaining'}
                </Text>
              </AutoRow>
            </StatsColumn>
            
            <ResponsiveButtonPrimary as={Link} to={'/stake/' + incentive.poolAddress + '/' + incentive.id}>
              <Trans>Manage</Trans>
            </ResponsiveButtonPrimary>
          </AutoRow>
        </AutoColumn>
      )}
    </AutoColumn>
  )
}

export default function ExpiredProgramCard({ poolAddress, incentives }: ExpiredProgramCardProps) {
  return (
    <>
      {incentives.map((incentive: Incentive) => (
        <ExpiredIncentiveRow key={incentive.id} incentive={incentive} />
      ))}
    </>
  )
}