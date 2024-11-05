import Row, { RowBetween, RowFixed } from 'components/Row'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { Incentive } from 'hooks/incentives/useAllIncentives'
import styled, { useTheme } from 'styled-components/macro'
import { darken, transparentize } from 'polished'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import { BIG_INT_SECONDS_IN_WEEK } from 'constants/misc'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { unwrappedToken } from 'utils/unwrappedToken'
import { EmptyBadge, GreenBadge } from 'components/Badge'
import useCountdownTime from 'hooks/useCountdownTime'
import { AutoColumn } from 'components/Column'
import { Trans } from '@lingui/macro'
import Countdown from './Countdown'
import { ThemedText } from '../../theme'

const Wrapper = styled.div`
  display: flex;
`

const BadgeText = styled(ThemedText.DeprecatedBody)`
  white-space: nowrap;
`

const BarWrapper = styled.div`
  width: 100%;
  height: calc(100% - 8px);
  border-radius: 20px;
  background-color: ${({ theme }) => transparentize(0.7, theme.deprecated_bg3)};
`

const Bar = styled.div<{ percent: number; color?: string }>`
  width: ${({ percent }) => `${percent}%`};
  height: 100%;
  border-radius: inherit;
  background: ${({ color, theme }) =>
    color ? `linear-gradient(to left, ${darken(0.18, color)}, ${darken(0.01, color)});` : theme.deprecated_blue4};
  display: flex;
  align-items: center;
  padding: 4px;
`

const WrappedLogo = styled(CurrencyLogo)`
  border: 1px solid black;
`

const LogoSquare = styled.div`
  background: rgba(243, 51, 143, 0.1);
  padding: 12px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1rem;
`

const TitleGrid = styled.div`
  padding: 0px;
  display: grid;
  grid-template-columns: 3fr 168px 168px;
  grid-column-gap: 24px;
  align-items: center;
  width: 100%;
`

interface IncentiveInfoBarProps {
  incentive: Incentive
  expanded?: boolean
}

export default function IncentiveInfoBar({ incentive, expanded }: IncentiveInfoBarProps) {
  const theme = useTheme()

  const rewardToken = incentive.initialRewardAmount.currency
  const rewardCurrency = unwrappedToken(rewardToken)

  const rewardTokensPerWeek = incentive.rewardRatePerSecond.multiply(BIG_INT_SECONDS_IN_WEEK)

  // may be null if no usd price for token
  const usdPerWeek = useStablecoinValue(rewardTokensPerWeek)

  const percentageRemaining =
    (parseFloat(incentive.rewardAmountRemaining.toExact()) / parseFloat(incentive.initialRewardAmount.toExact())) * 100

  // get countdown info if needed
  const startDate = new Date(incentive.startTime * 1000)
  const endDate = new Date(incentive.endTime * 1000)
  const beginsInFuture = incentive.startTime > Date.now() / 1000
  const countdownTimeText = useCountdownTime(startDate, endDate)

  return (
    <Wrapper>
      <AutoColumn gap="24px" style={{ width: '100%' }}>
        {!expanded ? null : (
          <RowBetween>
            <RowFixed>
              <CurrencyLogo currency={rewardToken} size="24px" />
              <ThemedText.DeprecatedBody fontWeight={500} fontSize="20px" m="0 8px">
                {`${rewardCurrency.symbol} Boost`}
              </ThemedText.DeprecatedBody>
            </RowFixed>
            <Countdown exactEnd={endDate} exactStart={startDate} />
          </RowBetween>
        )}
        <Row width="100%">
          {expanded ? null : (
            <LogoSquare>
              <CurrencyLogo currency={rewardToken} size="24px" />
            </LogoSquare>
          )}
          <AutoColumn gap="8px" style={{ width: '100%' }}>
            <TitleGrid>
              <ThemedText.DeprecatedBody fontSize="11px" fontWeight={400} color={theme.textTertiary}>
                <Trans>REWARDS REMAINING</Trans>
              </ThemedText.DeprecatedBody>
              <ThemedText.DeprecatedBody fontSize="11px" fontWeight={400} color={theme.textTertiary}>
                <Trans>TOTAL DEPOSITS</Trans>
              </ThemedText.DeprecatedBody>
              <ThemedText.DeprecatedBody fontSize="11px" fontWeight={400} color={theme.textTertiary}>
                <Trans>REWARDS</Trans>
              </ThemedText.DeprecatedBody>
            </TitleGrid>
            <TitleGrid>
              {beginsInFuture ? (
                <RowFixed>
                  <GreenBadge>
                    <ThemedText.DeprecatedBody fontWeight={700} color={theme.deprecated_yellow2} fontSize="12px">
                      <Trans>NEW</Trans>
                    </ThemedText.DeprecatedBody>
                  </GreenBadge>
                  <ThemedText.DeprecatedMain fontSize="12px" fontStyle="italic" ml="8px">
                    {countdownTimeText}
                  </ThemedText.DeprecatedMain>
                </RowFixed>
              ) : (
                <BarWrapper>
                  <Bar percent={percentageRemaining} color={theme.textPrimary}>
                    <RowFixed>
                      <WrappedLogo currency={rewardCurrency} size="14px" />
                      <ThemedText.DeprecatedBody fontSize="12px" fontWeight={600} ml="8px" mt="-2px">
                        {percentageRemaining}% remaining
                      </ThemedText.DeprecatedBody>
                    </RowFixed>
                  </Bar>
                </BarWrapper>
              )}
              <EmptyBadge style={{ borderRadius: '16px' }}>
                <BadgeText fontWeight={700} fontSize="14px">
                  $58,022
                </BadgeText>
              </EmptyBadge>
              <EmptyBadge style={{ borderRadius: '16px' }}>
                <BadgeText fontWeight={700} fontSize="14px">
                  {usdPerWeek
                    ? `$${formatCurrencyAmount(usdPerWeek, 2)}`
                    : `${formatCurrencyAmount(rewardTokensPerWeek, 3)} ${rewardToken.symbol}`}{' '}
                  Weekly
                </BadgeText>
              </EmptyBadge>
            </TitleGrid>
          </AutoColumn>
        </Row>
      </AutoColumn>
    </Wrapper>
  )
}
