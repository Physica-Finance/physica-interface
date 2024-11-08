import { BigNumber } from '@ethersproject/bignumber'
import { t, Trans } from '@lingui/macro'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { GreenBadge } from 'components/Badge'
import { ButtonPrimary } from 'components/Button'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import Modal from 'components/Modal'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { BIG_INT_SECONDS_IN_WEEK } from 'constants/misc'
import { Incentive } from 'hooks/incentives/useAllIncentives'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import { useState } from 'react'
import { AlertCircle } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'
import { CloseIcon, ThemedText } from 'theme'
import { formatCurrencyAmount } from 'utils/formatCurrencyAmount'

import { useV3Staker } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TransactionType } from '../../state/transactions/types'
import Countdown from './Countdown'
import Loader from '../Loader'

const Wrapper = styled.div`
  width: 100%;
  padding: 20px;
`

export const DarkerGreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.deprecated_bg1};
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  incentive: Incentive
}

export default function StakingModal({ isOpen, onDismiss, incentive }: StakingModalProps) {
  const { account } = useWeb3React()
  const theme = useTheme()
  const startDate = new Date(incentive.startTime * 1000)
  const endDate = new Date(incentive.endTime * 1000)
  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [positionDeposited, setPositionDeposited] = useState(false)
  const weeklyRewards = incentive.rewardRatePerSecond.multiply(BIG_INT_SECONDS_IN_WEEK)
  const weeklyRewardsUSD = useStablecoinValue(weeklyRewards)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useV3Staker()

  /*async function fetchDepositedPosition() {
    if (stakingContract && incentive && account) {
      await stakingContract
        .deposits(incentive.rewardAmountRemaining.currency.address, account!)
        .then((response: BigNumber) => {
          setPositionDeposited(response.gt(0))
        })
        .catch((error: any) => {
          console.log(error)
        })
    }
  }

  async function onClaimReward() {
    if (stakingContract && incentive && account) {
      setAttempting(true)
      await stakingContract
        .stakeToken(incentive.rewardAmountRemaining.currency.address, account!, { gasLimit: 350000 })
        .then((response: BigNumber) => {
          addTransaction(response, { type: TransactionType.CLAIM, recipient: account! })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  let error: string | undefined
  if (!account) {
    error = t`Connect wallet`
  }
  if (!stakingInfo?.stakedAmount) {
    error = error ?? t`Enter an amount`
  }*/

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss}>
      <Wrapper>
        <AutoColumn gap="lg">
          <RowBetween>
            <ThemedText.DeprecatedBody fontSize="20px" fontWeight={600}>
              <Trans>Review Position Staking</Trans>
            </ThemedText.DeprecatedBody>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <DarkerGreyCard>
            <AutoColumn gap="md">
              <RowBetween>
                <RowFixed>
                  <CurrencyLogo currency={incentive.initialRewardAmount.currency} />
                  <ThemedText.DeprecatedBody
                    m="0 12px"
                    fontSize="16px"
                  >{`${incentive.initialRewardAmount.currency.symbol} Boost`}</ThemedText.DeprecatedBody>
                </RowFixed>
                <Countdown exactEnd={endDate} exactStart={startDate} />
              </RowBetween>
              <AutoColumn gap="8px">
                <ThemedText.DeprecatedMain color={theme.textSecondary} fontWeight={400} fontSize="11px">
                  <Trans>YOUR ESTIMATED REWARDS</Trans>
                </ThemedText.DeprecatedMain>
                {weeklyRewardsUSD ? (
                  <span>
                    <ThemedText.DeprecatedBody>{`$${weeklyRewardsUSD.toFixed(2)} per week`}</ThemedText.DeprecatedBody>
                    <ThemedText.DeprecatedBody>{`~(${formatCurrencyAmount(
                      weeklyRewards,
                      4
                    )})`}</ThemedText.DeprecatedBody>
                  </span>
                ) : (
                  <ThemedText.DeprecatedBody>{`${formatCurrencyAmount(weeklyRewards, 4)} ${
                    weeklyRewards.currency.symbol
                  } per week`}</ThemedText.DeprecatedBody>
                )}
              </AutoColumn>
            </AutoColumn>
          </DarkerGreyCard>
          <ThemedText.DeprecatedBody fontSize="11px" fontWeight={500}>
            <Trans>
              Boosting liquidity deposits your liquidity in the Physica Liquidity mining contracts. When boosted, your
              liquidity will continue to earn fees while in range. You must remove boosts to be able to claim fees or
              withdraw liquidity.
            </Trans>
          </ThemedText.DeprecatedBody>
          <ButtonPrimary padding="8px" $borderRadius="12px">
            <Trans>Join Programs</Trans>
          </ButtonPrimary>
        </AutoColumn>
      </Wrapper>
    </Modal>
  )
}

interface ClaimModalProps {
  incentives: Incentive[]
  isOpen: boolean
  onDismiss: () => void
}

export function ClaimModal({ incentives, isOpen, onDismiss }: ClaimModalProps) {
  const { account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [rewards, setRewards] = useState<BigNumber[] | undefined>([])

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useV3Staker()

  async function fetchRewards() {
    if (stakingContract && incentives && account) {
      incentives.map(async (incentive) => {
        await stakingContract
          .rewards(incentive.rewardAmountRemaining.currency.address, account!, { gasLimit: 350000 })
          .then((response: BigNumber) => {
            setRewards([...rewards!, response])
          })
          .catch((error: any) => {
            console.log(error)
          })
      })
      /*setAttempting(true)
      await stakingContract
        .rewards(incentive.rewardAmountRemaining.currency.address, account!,{ gasLimit: 350000 })
        .then((response: BigNumber) => {
          addTransaction(response, { type: TransactionType.CLAIM, recipient: account! })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })*/
    }
  }
  fetchRewards()
  let error: string | undefined
  if (!account) {
    error = t`Connect wallet`
  }
  /*if (!stakingInfo?.stakedAmount) {
    error = error ?? t`Enter an amount`
  }*/

  return !rewards ? (<Loader />) : (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <Wrapper>
        <AutoColumn gap="md">
          <RowBetween>
            <ThemedText.DeprecatedBody fontSize="20px" fontWeight={600}>
              <Trans>Claim Rewards</Trans>
            </ThemedText.DeprecatedBody>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <DarkerGreyCard>
            <AutoColumn gap="md" justify="center">
              <ThemedText.DeprecatedBody ml="12px" fontSize="11px" fontWeight={400}>
                <Trans>TOTAL UNCLAIMED REWARDS</Trans>
              </ThemedText.DeprecatedBody>
              {incentives.map((incentive, i) => (
                <AutoRow gap="8px" key={'reward-row' + i} width="fit-content">
                  <CurrencyLogo currency={incentive.initialRewardAmount.currency} size="24px" />
                  <ThemedText.DeprecatedBody fontSize="20px" fontWeight={500}>
                    {formatCurrencyAmount(
                      CurrencyAmount.fromRawAmount(incentive.initialRewardAmount.currency, rewards![i]!.toString()),
                      5
                    )}
                  </ThemedText.DeprecatedBody>
                  <ThemedText.DeprecatedBody fontSize="20px" fontWeight={500}>
                    {incentive.initialRewardAmount.currency.symbol}
                  </ThemedText.DeprecatedBody>
                </AutoRow>
              ))}
            </AutoColumn>
          </DarkerGreyCard>
          <ButtonPrimary padding="8px" $borderRadius="12px">
            <Trans>Claim</Trans>
          </ButtonPrimary>
          <DarkerGreyCard>
            <RowBetween>
              <AlertCircle size={60} />
              <ThemedText.DeprecatedBody ml="12px" fontSize="12px" fontWeight={500}>
                <Trans>
                  Claiming rewards withdraws the rewards into your wallet. Your liquidity remains staked and will
                  continue to earn fees when in range.
                </Trans>
              </ThemedText.DeprecatedBody>
            </RowBetween>
          </DarkerGreyCard>
        </AutoColumn>
      </Wrapper>
    </Modal>
  )
}

interface UnstakeModalProps {
  incentives: Incentive[]
  isOpen: boolean
  onDismiss: () => void
}

export function UnstakeModal({ incentives, isOpen, onDismiss }: UnstakeModalProps) {
  /**
   * @TODO
   * real claim amounts
   */

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <Wrapper>
        <AutoColumn gap="md">
          <RowBetween>
            <ThemedText.DeprecatedBody fontSize="20px" fontWeight={600}>
              <Trans>Unstake Rewards</Trans>
            </ThemedText.DeprecatedBody>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <GreenBadge style={{ padding: '16px' }}>
            <AutoColumn gap="sm" justify="center">
              <AlertCircle size={20} />
              <ThemedText.DeprecatedBody
                fontWeight={500}
                fontSize="14px"
                style={{ whiteSpace: 'normal' }}
                textAlign="center"
              >
                <Trans>
                  You are unstaking your liquidty! You can now remove your position or claim regular liquidity provider
                  fees.
                </Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>
          </GreenBadge>
          <DarkerGreyCard>
            <AutoColumn gap="md" justify="center">
              <ThemedText.DeprecatedBody ml="12px" fontSize="11px" fontWeight={400}>
                <Trans>TOTAL UNCLAIMED REWARDS</Trans>
              </ThemedText.DeprecatedBody>
              {incentives.map((incentive, i) => (
                <AutoRow gap="8px" key={'reward-row' + i} width="fit-content">
                  <CurrencyLogo currency={incentive.initialRewardAmount.currency} size="24px" />
                  <ThemedText.DeprecatedBody fontSize="20px" fontWeight={500}>
                    {formatCurrencyAmount(incentive.initialRewardAmount, 5)}
                  </ThemedText.DeprecatedBody>
                  <ThemedText.DeprecatedBody fontSize="20px" fontWeight={500}>
                    {incentive.initialRewardAmount.currency.symbol}
                  </ThemedText.DeprecatedBody>
                </AutoRow>
              ))}
            </AutoColumn>
          </DarkerGreyCard>
          <ButtonPrimary padding="8px" $borderRadius="12px">
            <Trans>Unstake and Claim</Trans>
          </ButtonPrimary>
        </AutoColumn>
      </Wrapper>
    </Modal>
  )
}
