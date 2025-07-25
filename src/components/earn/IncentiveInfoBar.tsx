import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import Badge, { EmptyBadge, GreenBadge } from 'components/Badge'
import { ButtonError } from 'components/Button'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { BIG_INT_SECONDS_IN_WEEK } from 'constants/misc'
import { Incentive } from 'hooks/incentives/useAllIncentives'
import useCountdownTime from 'hooks/useCountdownTime'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import { darken, transparentize } from 'polished'
import { useCallback, useState } from 'react'
import styled, { useTheme } from 'styled-components/macro'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { useToken } from '../../hooks/Tokens'
import { useV3Staker } from '../../hooks/useContract'
import { LoadingRows } from '../../pages/Pool/styleds'
import { ThemedText } from '../../theme'
import Countdown from './Countdown'

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
  const { account } = useWeb3React()
  const staker = useV3Staker()
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

  const rewardCurrency = useToken(incentive.initialRewardAmount.currency.address)

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
  
  // Check if incentive is expired and user is the refundee
  const isExpired = incentive.endTime < Date.now() / 1000
  const isRefundee = account && account.toLowerCase() === incentive.refundee.toLowerCase()
  const canWithdraw = isExpired && isRefundee && incentive.rewardAmountRemaining.greaterThan(0)
  
  const handleWithdraw = useCallback(async () => {
    if (!staker || !rewardCurrency) return
    
    setWithdrawing(true)
    setWithdrawError(null)
    
    try {
      const incentiveKey = {
        rewardToken: rewardCurrency.address,
        pool: incentive.poolAddress,
        startTime: incentive.startTime,
        endTime: incentive.endTime,
        refundee: incentive.refundee,
      }
      
      // The endIncentive function withdraws remaining rewards to the refundee
      const tx = await staker.endIncentive(incentiveKey)
      
      await tx.wait()
      // Optionally refresh the page or update state
      window.location.reload()
    } catch (error: any) {
      console.error('Error withdrawing tokens:', error)
      
      // Parse the error message for user-friendly display
      let errorMessage = 'Failed to withdraw tokens'
      
      if (error?.reason?.includes('cannot end incentive while deposits are staked')) {
        errorMessage = 'Cannot end incentive while positions are still staked. All positions must be unstaked first.'
      } else if (error?.reason) {
        errorMessage = error.reason
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      setWithdrawError(errorMessage)
    } finally {
      setWithdrawing(false)
    }
  }, [staker, rewardCurrency, incentive, account])

  return (
    <Wrapper>
      {!rewardCurrency ? (
        <LoadingRows>
          <div />
        </LoadingRows>
      ) : (
        <AutoColumn gap="24px" style={{ width: '100%' }}>
          {!expanded ? null : (
            <RowBetween>
              <RowFixed>
                <CurrencyLogo currency={rewardCurrency} size="24px" />
                <ThemedText.DeprecatedBody fontWeight={500} fontSize="20px" m="0 8px">
                  {`${rewardCurrency.symbol} Boost`}
                </ThemedText.DeprecatedBody>
                {isExpired && (
                  <Badge style={{ marginLeft: '8px', backgroundColor: theme.deprecated_error }}>
                    <BadgeText>Expired</BadgeText>
                  </Badge>
                )}
              </RowFixed>
              {isExpired ? (
                <ThemedText.DeprecatedBody fontSize="14px" color={theme.textSecondary}>
                  <Trans>Ended {new Date(endDate).toLocaleDateString()}</Trans>
                </ThemedText.DeprecatedBody>
              ) : (
                <Countdown exactEnd={endDate} exactStart={startDate} />
              )}
            </RowBetween>
          )}
          <Row width="100%">
            {expanded ? null : (
              <LogoSquare>
                <CurrencyLogo currency={rewardCurrency} size="24px" />
              </LogoSquare>
            )}
            <AutoColumn gap="8px" style={{ width: '100%' }}>
              <TitleGrid>
                <ThemedText.DeprecatedBody fontSize="11px" fontWeight={400} color={theme.textTertiary}>
                  <Trans>REWARDS REMAINING</Trans>
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
                    <Bar percent={percentageRemaining} color={theme.textTertiary}>
                      <RowFixed>
                        <WrappedLogo currency={rewardCurrency} size="14px" />
                        <ThemedText.DeprecatedBody fontSize="12px" fontWeight={600} ml="8px" mt="-2px">
                          {percentageRemaining.toFixed(2)}% remaining
                        </ThemedText.DeprecatedBody>
                      </RowFixed>
                    </Bar>
                  </BarWrapper>
                )}

                <EmptyBadge style={{ borderRadius: '16px' }}>
                  <BadgeText fontWeight={700} fontSize="14px">
                    {usdPerWeek
                      ? `$${formatCurrencyAmount(usdPerWeek, 2)}`
                      : `${formatCurrencyAmount(rewardTokensPerWeek, 3)} ${rewardCurrency.symbol}`}{' '}
                    Weekly
                  </BadgeText>
                </EmptyBadge>
              </TitleGrid>
            </AutoColumn>
          </Row>
          {canWithdraw && expanded && (
            <AutoColumn gap="8px">
              <ThemedText.DeprecatedBody fontSize="12px" color={theme.textSecondary}>
                <Trans>All positions must be unstaked before ending the incentive program.</Trans>
              </ThemedText.DeprecatedBody>
              <ButtonError
                disabled={withdrawing}
                onClick={handleWithdraw}
                style={{ marginTop: '8px' }}
              >
                {withdrawing ? (
                  <Trans>Ending Incentive...</Trans>
                ) : (
                  <Trans>End Incentive & Withdraw</Trans>
                )}
              </ButtonError>
              {withdrawError && (
                <ThemedText.DeprecatedError fontSize="12px" style={{ marginTop: '4px' }}>
                  {withdrawError}
                </ThemedText.DeprecatedError>
              )}
            </AutoColumn>
          )}
        </AutoColumn>
      )}
    </Wrapper>
  )
}
