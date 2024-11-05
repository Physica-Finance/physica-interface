import { Trans } from '@lingui/macro'
import Badge from 'components/Badge'
import { ButtonSmall } from 'components/Button'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { BIG_INT_ZERO } from 'constants/misc'
import { Incentive } from 'hooks/incentives/useAllIncentives'
import { useMemo, useState } from 'react'
import { Zap } from 'react-feather'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components/macro'
import { PositionDetails } from 'types/position'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import StakingModal, { ClaimModal, UnstakeModal } from './StakingModal'
import RangeStatus from 'components/RangeStatus'
import { BigNumber } from '@ethersproject/bignumber'
import { ThemedText } from 'theme'

const Wrapper = styled.div`
  width: 100%;
`

const PositionWrapper = styled.div<{ staked?: boolean }>`
  width: 100%;
  border: 1px solid ${({ theme, staked }) => (staked ? theme.deprecated_blue4 : theme.deprecated_bg3)};
  border-radius: 12px;
  padding: 16px;
`

interface BoostStatusRowProps {
  incentive: Incentive
  positionDetails: PositionDetails
  unstaked?: boolean // show minimal UI on unstaked positions
  isPositionPage?: boolean
}

function BoostStatusRow({ incentive, positionDetails, unstaked, isPositionPage }: BoostStatusRowProps) {
  const theme = useTheme()

  const rewardCurrency = incentive.initialRewardAmount.currency

  const availableClaim = incentive.initialRewardAmount
  const weeklyRewards = incentive.initialRewardAmount
  const totalUnclaimedUSD = 0

  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showUnstakeModal, setShowUnstakeModal] = useState(false)

  return (
    <>
      <StakingModal isOpen={showStakingModal} onDismiss={() => setShowStakingModal(false)} incentive={incentive} />
      <ClaimModal isOpen={showClaimModal} onDismiss={() => setShowClaimModal(false)} incentives={[incentive]} />
      <UnstakeModal isOpen={showUnstakeModal} onDismiss={() => setShowUnstakeModal(false)} incentives={[incentive]} />
      {unstaked ? (
        <PositionWrapper>
          <RowBetween>
            <RangeStatus positionDetails={positionDetails} />
            <ButtonSmall onClick={() => setShowStakingModal(true)}>
              <Trans>Stake Position</Trans>
            </ButtonSmall>
          </RowBetween>
        </PositionWrapper>
      ) : (
        <PositionWrapper staked={true}>
          <RowBetween>
            <AutoColumn gap="16px" style={{ width: '100%' }}>
              {isPositionPage ? (
                <RowBetween>
                  <RowFixed>
                    <Zap strokeWidth="3px" color={theme.deprecated_blue4} size="16px" />
                    <ThemedText.DeprecatedBody ml="8px" fontWeight={500} color={theme.deprecated_blue4}>
                      Position is Staked
                    </ThemedText.DeprecatedBody>
                  </RowFixed>
                  <ButtonSmall as={Link} to={'/stake/' + incentive.poolAddress}>
                    <Trans>Manage</Trans>
                  </ButtonSmall>
                </RowBetween>
              ) : null}
              {isPositionPage ? null : <RangeStatus positionDetails={positionDetails} />}
              <ThemedText.DeprecatedBody fontSize="11px" color={theme.textTertiary}>
                <Trans>UNCLAIMED REWARDS</Trans>
              </ThemedText.DeprecatedBody>
              <RowBetween>
                <RowFixed>
                  <ThemedText.DeprecatedBody fontSize="24px" color={theme.deprecated_yellow2} fontWeight={500}>
                    <Trans>
                      {totalUnclaimedUSD
                        ? '$' + totalUnclaimedUSD
                        : `${formatCurrencyAmount(availableClaim, 5)} ${rewardCurrency.symbol}`}
                    </Trans>
                  </ThemedText.DeprecatedBody>
                  <Badge style={{ margin: '0 12px' }}>
                    <CurrencyLogo currency={rewardCurrency} size="20px" />
                    <ThemedText.DeprecatedBody m="0 12px" fontSize="15px" fontWeight={500}>
                      {`~ ${formatCurrencyAmount(weeklyRewards, 5)} ${rewardCurrency.symbol} / Week `}
                    </ThemedText.DeprecatedBody>
                  </Badge>
                </RowFixed>
                <AutoRow gap="8px" width="fit-content">
                  {availableClaim.greaterThan(BIG_INT_ZERO) ? (
                    <ButtonSmall onClick={() => setShowClaimModal(true)}>
                      <Trans>Claim</Trans>
                    </ButtonSmall>
                  ) : null}
                  <ButtonSmall onClick={() => setShowUnstakeModal(true)}>
                    <Trans>Unstake</Trans>
                  </ButtonSmall>
                </AutoRow>
              </RowBetween>
            </AutoColumn>
          </RowBetween>
        </PositionWrapper>
      )}
    </>
  )
}

interface PositionManageCardProps {
  positionDetails: PositionDetails
  isPositionPage?: boolean
}

export default function PositionManageCard({ positionDetails, isPositionPage }: PositionManageCardProps) {
  const { stakes } = positionDetails

  // filter incentives that are staked and unstaked
  const [staked, unstaked] = useMemo(
    () =>
      stakes.slice(0, 1).reduce(
        (accum: Incentive[][], stake) => {
          if (stake.liquidity.gt(BigNumber.from(0))) {
            accum[0].push(stake.incentive)
          } else {
            accum[1].push(stake.incentive)
          }
          return accum
        },
        [[], []]
      ),
    [stakes]
  )

  return (
    <Wrapper>
      <AutoColumn gap="16px">
        {staked.map((incentive, i) => (
          <BoostStatusRow
            key={'boost-status' + i}
            incentive={incentive}
            positionDetails={positionDetails}
            isPositionPage={isPositionPage}
          />
        ))}
        {unstaked.map((incentive, i) => {
          return (
            <BoostStatusRow
              key={'boost-status' + i}
              incentive={incentive}
              positionDetails={positionDetails}
              unstaked={true}
              isPositionPage={isPositionPage}
            />
          )
        })}
      </AutoColumn>
    </Wrapper>
  )
}
