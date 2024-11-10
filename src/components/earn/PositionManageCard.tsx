import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import Badge from 'components/Badge'
import { ButtonSmall } from 'components/Button'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import RangeStatus from 'components/RangeStatus'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { BIG_INT_SECONDS_IN_WEEK } from 'constants/misc'
import { Incentive } from 'hooks/incentives/useAllIncentives'
import { useMemo, useState } from 'react'
import { Zap } from 'react-feather'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'
import { PositionDetails } from 'types/position'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { useV3Staker } from '../../hooks/useContract'
import Loader from '../Loader'
import StakingModal, { ClaimModal, UnstakeModal, WithdrawModal } from './StakingModal'
import { LightCard } from '../Card'
import { useToken } from '../../hooks/Tokens'
import { LoadingRows } from '../Loader/styled'

const Wrapper = styled.div`
  width: 100%;
`

const PositionWrapper = styled.div<{ staked?: boolean }>`
  width: 100%;
  //border: 1px solid ${({ theme, staked }) => (staked ? theme.deprecated_blue4 : theme.deprecated_bg3)};
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
  const { account } = useWeb3React()

  const rewardCurrency = useToken(incentive.initialRewardAmount.currency.address)
  const stakingContract = useV3Staker()

  const weeklyRewards = incentive.rewardRatePerSecond.multiply(BIG_INT_SECONDS_IN_WEEK)
  const totalUnclaimedUSD = 0
  const [positionDeposited, setPositionDeposited] = useState(false)
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showUnstakeModal, setShowUnstakeModal] = useState(false)
  const [rewards, setRewards] = useState<BigNumber | undefined>()
  const [rewardsChecked, setRewardsChecked] = useState(false)

  if (!positionDeposited) {
    stakingContract?.deposits(positionDetails.tokenId).then((response: any) => {
      if (response.owner === account) {
        setPositionDeposited(true)
      }
    })
  }

  if (stakingContract && incentive && account && !rewardsChecked) {
    stakingContract
      .getRewardInfo(
        {
          rewardToken: incentive.initialRewardAmount.currency.address,
          pool: incentive.poolAddress,
          startTime: incentive.startTime,
          endTime: incentive.endTime,
          refundee: incentive.refundee,
        },
        positionDetails.tokenId,
        { gasLimit: 350000 }
      )
      .then((response: [BigNumber, BigNumber]) => {
        setRewards(response[0])
        setRewardsChecked(true)
      })
      .catch((error: any) => {
        setRewards(BigNumber.from(0))
        setRewardsChecked(true)
        console.log(error)
      })
  }

  return !rewardCurrency ? (
    <LoadingRows />
  ) : (
    <>
      <StakingModal
        isOpen={showStakingModal}
        onDismiss={() => setShowStakingModal(false)}
        incentive={incentive}
        positionDetails={positionDetails}
      />
      <WithdrawModal
        isOpen={showWithdrawModal}
        onDismiss={() => setShowWithdrawModal(false)}
        incentive={incentive}
        positionDetails={positionDetails}
      />
      <ClaimModal
        isOpen={showClaimModal}
        onDismiss={() => setShowClaimModal(false)}
        incentive={incentive}
        positionDetails={positionDetails}
      />
      <UnstakeModal
        isOpen={showUnstakeModal}
        onDismiss={() => setShowUnstakeModal(false)}
        incentive={incentive}
        positionDetails={positionDetails}
      />
      {unstaked ? (
        <PositionWrapper>
          <RowBetween>
            <RangeStatus positionDetails={positionDetails} />
            <ButtonSmall onClick={() => setShowStakingModal(true)}>
              {!positionDeposited ? (<Trans>Deposit Position</Trans>) : (<Trans>Stake Position</Trans>)}
            </ButtonSmall>
            {!positionDeposited ? null : (
            <ButtonSmall onClick={() => setShowWithdrawModal(true)}>
              <Trans>Withdraw from Staker</Trans>
            </ButtonSmall>
            )}
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
                        : `${formatCurrencyAmount(
                            CurrencyAmount.fromRawAmount(
                              rewardCurrency,
                              (rewards ?? 0).toString()
                            ),
                            5
                          )} ${rewardCurrency.symbol}`}
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
                  {rewards?.gt(BigNumber.from(0)) ? (
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
    </>)
}

interface PositionManageCardProps {
  positionDetails: PositionDetails
  isPositionPage?: boolean
  incentive?: Incentive | undefined
}

export default function PositionManageCard({ positionDetails, isPositionPage, incentive }: PositionManageCardProps) {
  const { stakes } = positionDetails
  const { account } = useWeb3React()
  const [positionStaked, setPositionStaked] = useState(false)
  const [positionCheck, setPositionCheck] = useState(false)
  const staker = useV3Staker()

  if (!positionCheck && incentive) {
    staker?.stakes(positionDetails.tokenId, incentive.id).then((response: any) => {
      if (response.liquidity.gt(BigNumber.from(0))) {
        setPositionStaked(true)
      } else {
        setPositionStaked(false)
      }
      setPositionCheck(true)
    })
  }


  return (
    <Wrapper>
      {!positionCheck || !incentive ? (
        <Loader />
      ) : (
        <AutoColumn gap="16px">
          <LightCard padding="0px" border="none">
            <BoostStatusRow
              key={'boost-status' + 0}
              incentive={incentive}
              unstaked={!positionStaked}
              positionDetails={positionDetails}
              isPositionPage={isPositionPage}
            />
          </LightCard>
        </AutoColumn>
      )}
    </Wrapper>
  )
}
