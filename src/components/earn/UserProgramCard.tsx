import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Badge from 'components/Badge'
import { ButtonPrimary } from 'components/Button'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { AutoRow } from 'components/Row'
import { BIG_INT_SECONDS_IN_DAY } from 'constants/misc'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import { LoadingRows } from 'pages/Pool/styleds'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components/macro'
import { formattedFeeAmount } from 'utils'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { Incentive } from '../../hooks/incentives/useAllIncentives'
import { useCurrency, useToken } from '../../hooks/Tokens'
import { AutoColumn } from '../Column'

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

interface UserProgramCardProps {
  poolAddress: string
  incentives: Incentive[]
}

function IncentiveRow({ incentive }: { incentive: Incentive }) {
  const theme = useTheme()
  const { account } = useWeb3React()

  const currency0 = useCurrency(incentive.pool.token0.address)
  const currency1 = useCurrency(incentive.pool.token1.address)
  const rewardCurrency = useToken(incentive.initialRewardAmount.currency.address)
  const activeLiquidity = incentive.initialRewardAmount
  const activeLiquidityUSD = useStablecoinValue(activeLiquidity)
  const rewardPerDay = incentive.rewardRatePerSecond.multiply(BIG_INT_SECONDS_IN_DAY)

  const isExpired = incentive.endTime < Date.now() / 1000
  const isActive = !isExpired && incentive.startTime <= Date.now() / 1000
  const isUpcoming = incentive.startTime > Date.now() / 1000

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
              {isActive && (
                <Badge style={{ marginLeft: '4px', backgroundColor: theme.deprecated_primary2 }}>
                  <BadgeText>Active</BadgeText>
                </Badge>
              )}
              {isExpired && (
                <Badge style={{ marginLeft: '4px', backgroundColor: theme.deprecated_primary5 }}>
                  <BadgeText>Expired</BadgeText>
                </Badge>
              )}
              {isUpcoming && (
                <Badge style={{ marginLeft: '4px', backgroundColor: theme.deprecated_yellow2 }}>
                  <BadgeText>Upcoming</BadgeText>
                </Badge>
              )}
            </Text>
            <AutoColumn justify={'end'}>
              <Text>
                {activeLiquidityUSD
                  ? `$${formatCurrencyAmount(activeLiquidityUSD, 2)}`
                  : `${formatCurrencyAmount(activeLiquidity, 4)} ${rewardCurrency.symbol}`}
              </Text>
              <AutoRow justify={'stretch'}>
                <CurrencyLogo currency={rewardCurrency} size="16px" />
                <Text>{`${formatCurrencyAmount(rewardPerDay, 4)} ${rewardCurrency.symbol} / day`}</Text>
              </AutoRow>
            </AutoColumn>
            <ResponsiveButtonPrimary as={Link} to={'/stake/' + incentive.poolAddress + '/' + incentive.id}>
              <Trans>Manage</Trans>
            </ResponsiveButtonPrimary>
          </AutoRow>
        </AutoColumn>
      )}
    </AutoColumn>
  )
}

export default function UserProgramCard({ poolAddress, incentives }: UserProgramCardProps) {
  return (
    <>
      {incentives.map((incentive: Incentive) => (
        <IncentiveRow key={incentive.id} incentive={incentive} />
      ))}
    </>
  )
}
