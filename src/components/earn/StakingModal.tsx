import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
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

import { useV3NFTPositionManagerContract, useV3Staker } from '../../hooks/useContract'
import { useIsTransactionPending, useTransactionAdder } from '../../state/transactions/hooks'
import { TransactionType } from '../../state/transactions/types'
import { PositionDetails } from '../../types/position'
import Loader from '../Loader'
import Countdown from './Countdown'
import { useToken } from '../../hooks/Tokens'

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
  positionDetails: PositionDetails
}

export default function StakingModal({ isOpen, onDismiss, incentive, positionDetails }: StakingModalProps) {
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

  console.log(positionDetails)
  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const staker = useV3Staker()
  const positionManager = useV3NFTPositionManagerContract()

  if (!positionDeposited) {
    staker?.deposits(positionDetails.tokenId).then((response: any) => {
      if (response.owner === account) {
        setPositionDeposited(true)
        console.log(response)
      }
    })
  }

  async function onDepositPosition() {
    if (positionManager && incentive && account && staker) {
      setAttempting(true)
      await positionManager['safeTransferFrom(address,address,uint256)'](
        account,
        staker.address,
        positionDetails.tokenId,
        { gasLimit: 350000 }
      )
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.DEPOSIT_LIQUIDITY_STAKING,
            token0Address: positionDetails.token0,
            token1Address: positionDetails.token1,
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  async function onStakePosition() {
    if (staker && incentive && account) {
      setAttempting(true)
      await staker
        .stakeToken(
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
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.DEPOSIT_LIQUIDITY_STAKING,
            token0Address: positionDetails.token0,
            token1Address: positionDetails.token1,
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  /*async function onClaimReward() {
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
  }*/

  let error: string | undefined
  if (!account) {
    error = t`Connect wallet`
  }

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
          {positionDeposited ? ( // if position is already deposited, show the stake button
            <ButtonPrimary disabled={attempting} padding="8px" $borderRadius="12px" onClick={onStakePosition}>
              <Trans>Stake Position</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary disabled={attempting} padding="8px" $borderRadius="12px" onClick={onDepositPosition}>
              <Trans>Deposit Position</Trans>
            </ButtonPrimary>
          )}
        </AutoColumn>
      </Wrapper>
    </Modal>
  )
}

export function WithdrawModal({ isOpen, onDismiss, incentive, positionDetails }: StakingModalProps) {
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
  const rewardCurrency = useToken(incentive.initialRewardAmount.currency.address)

  console.log(positionDetails)
  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const staker = useV3Staker()
  const positionManager = useV3NFTPositionManagerContract()

  if (!positionDeposited) {
    staker?.deposits(positionDetails.tokenId).then((response: any) => {
      if (response.owner === account) {
        setPositionDeposited(true)
        console.log(response)
      }
    })
  }

  async function onDepositPosition() {
    if (positionManager && incentive && account && staker) {
      setAttempting(true)
      await positionManager['safeTransferFrom(address,address,uint256)'](
        account,
        staker.address,
        positionDetails.tokenId,
        { gasLimit: 350000 }
      )
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.DEPOSIT_LIQUIDITY_STAKING,
            token0Address: positionDetails.token0,
            token1Address: positionDetails.token1,
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  async function onWithdrawPosition() {
    if (staker && incentive && account) {
      setAttempting(true)
      await staker
        .withdrawToken(positionDetails.tokenId, account, '0x0', { gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.WITHDRAW_LIQUIDITY_STAKING,
            token0Address: positionDetails.token0,
            token1Address: positionDetails.token1,
          })
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

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss}>
      {!rewardCurrency ? (<Loader/>) : (
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
                  <CurrencyLogo currency={rewardCurrency} />
                  <ThemedText.DeprecatedBody
                    m="0 12px"
                    fontSize="16px"
                  >{`${rewardCurrency.symbol} Boost`}</ThemedText.DeprecatedBody>
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
                    rewardCurrency.symbol
                  } per week`}</ThemedText.DeprecatedBody>
                )}
              </AutoColumn>
            </AutoColumn>
          </DarkerGreyCard>
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
                  You are withdrawing your position! You can now withdraw your position and claim regular liquidity provider
                  fees. Make sure to unstake this position first from all boost programs to withdraw it.
                </Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>
          </GreenBadge>
          {positionDeposited ? ( // if position is already deposited, show the stake button
            <ButtonPrimary disabled={attempting} padding="8px" $borderRadius="12px" onClick={onWithdrawPosition}>
              <Trans>Withdraw Position</Trans>
            </ButtonPrimary>
          ) : (<Loader/>)}
        </AutoColumn>
      </Wrapper>
      )}
    </Modal>
  )
}

interface ClaimModalProps {
  incentive: Incentive
  isOpen: boolean
  onDismiss: () => void
  positionDetails: PositionDetails
}

export function ClaimModal({ incentive, isOpen, onDismiss, positionDetails }: ClaimModalProps) {
  const { account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [rewards, setRewards] = useState<BigNumber | undefined>()
  const claimPending = useIsTransactionPending(hash ?? '')
  const claimConfirmed = hash && !claimPending
  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useV3Staker()

  if (stakingContract && incentive && account && !rewards) {
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
      })
      .catch((error: any) => {
        setRewards(BigNumber.from(0))
        console.log(error)
      })
  }

  async function onUnstake() {
    if (stakingContract && incentive && account && rewards) {
      setAttempting(true)
      await stakingContract
        .unstakeToken(
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
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.WITHDRAW_LIQUIDITY_STAKING,
            token0Address: positionDetails.token0,
            token1Address: positionDetails.token1,
          })
          setHash(response.hash)
          onClaimRewards()
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  async function onStakePosition() {
    if (stakingContract && incentive && account) {
      setAttempting(true)
      await stakingContract
        .stakeToken(
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
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.DEPOSIT_LIQUIDITY_STAKING,
            token0Address: positionDetails.token0,
            token1Address: positionDetails.token1,
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  async function onClaimRewards() {
    if (stakingContract && incentive && account && rewards) {
      setAttempting(true)
      await stakingContract
        .claimReward(incentive.rewardRatePerSecond.currency.address, account, BigNumber.from(0), { gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.CLAIM,
            recipient: account,
            uniAmountRaw: rewards.toString(),
          })
          setHash(response.hash)
          onStakePosition()
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

  return !rewards ? (
    <Loader />
  ) : (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss}>
      <Wrapper>
        <AutoColumn gap="md">
          <RowBetween>
            <ThemedText.DeprecatedBody fontSize="20px" fontWeight={600}>
              <Trans>Claim Rewards</Trans>
            </ThemedText.DeprecatedBody>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <DarkerGreyCard>
            <AutoColumn gap="md" justify="center">
              <ThemedText.DeprecatedBody ml="12px" fontSize="11px" fontWeight={400}>
                {claimConfirmed ? <Trans>CLAIMED REWARDS</Trans> : <Trans>TOTAL UNCLAIMED REWARDS</Trans>}
              </ThemedText.DeprecatedBody>
              <AutoRow gap="8px" key="reward-row" width="fit-content">
                <CurrencyLogo currency={incentive.initialRewardAmount.currency} size="24px" />
                <ThemedText.DeprecatedBody fontSize="20px" fontWeight={500}>
                  {claimPending ? (
                    <Loader />
                  ) : (
                    formatCurrencyAmount(
                      CurrencyAmount.fromRawAmount(
                        incentive.initialRewardAmount.currency,
                        rewards ? rewards!.toString() : '0'
                      ),
                      5
                    )
                  )}
                </ThemedText.DeprecatedBody>
                <ThemedText.DeprecatedBody fontSize="20px" fontWeight={500}>
                  {incentive.initialRewardAmount.currency.symbol}
                </ThemedText.DeprecatedBody>
              </AutoRow>
            </AutoColumn>
          </DarkerGreyCard>
          <ButtonPrimary disabled={attempting} padding="8px" $borderRadius="12px" onClick={onUnstake}>
            <Trans>Claim</Trans>
          </ButtonPrimary>
          <DarkerGreyCard>
            <RowBetween>
              <AlertCircle size={60} />
              <ThemedText.DeprecatedBody ml="12px" fontSize="12px" fontWeight={500}>
                <Trans>
                  Claiming rewards withdraws the rewards into your wallet. Your liquidity remains staked and will
                  continue to earn fees when in range. This will execute 3 transactions, one to unstake, one to claim
                  rewards and one to restake your position.
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
  incentive: Incentive
  isOpen: boolean
  onDismiss: () => void
  positionDetails: PositionDetails
}

export function UnstakeModal({ incentive, isOpen, onDismiss, positionDetails }: UnstakeModalProps) {
  const { account } = useWeb3React()
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [rewards, setRewards] = useState<BigNumber | undefined>()
  const claimPending = useIsTransactionPending(hash ?? '')
  const claimConfirmed = hash && !claimPending
  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const stakingContract = useV3Staker()

  if (stakingContract && incentive && account && !rewards) {
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
      })
      .catch((error: any) => {
        setRewards(BigNumber.from(0))
        console.log(error)
      })
  }

  async function onClaimRewards() {
    if (stakingContract && incentive && account && rewards) {
      setAttempting(true)
      await stakingContract
        .claimReward(incentive.rewardRatePerSecond.currency.address, account, BigNumber.from(0), { gasLimit: 350000 })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.CLAIM,
            recipient: account,
            uniAmountRaw: rewards.toString(),
          })
          setHash(response.hash)
        })
        .catch((error: any) => {
          setAttempting(false)
          console.log(error)
        })
    }
  }

  async function onUnstake() {
    if (stakingContract && incentive && account && rewards) {
      setAttempting(true)
      await stakingContract
        .unstakeToken(
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
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.WITHDRAW_LIQUIDITY_STAKING,
            token0Address: positionDetails.token0,
            token1Address: positionDetails.token1,
          })
          setHash(response.hash)
          onClaimRewards()
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

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss}>
      <Wrapper>
        <AutoColumn gap="md">
          <RowBetween>
            <ThemedText.DeprecatedBody fontSize="20px" fontWeight={600}>
              <Trans>Unstake Rewards</Trans>
            </ThemedText.DeprecatedBody>
            <CloseIcon onClick={wrappedOnDismiss} />
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
                  fees. This will execute two transactions, one to unstake and one to claim rewards.
                </Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>
          </GreenBadge>
          <DarkerGreyCard>
            <AutoColumn gap="md" justify="center">
              <ThemedText.DeprecatedBody ml="12px" fontSize="11px" fontWeight={400}>
                <Trans>TOTAL UNCLAIMED REWARDS</Trans>
              </ThemedText.DeprecatedBody>
              <AutoRow gap="8px" key="reward-row" width="fit-content">
                <CurrencyLogo currency={incentive.initialRewardAmount.currency} size="24px" />
                <ThemedText.DeprecatedBody fontSize="20px" fontWeight={500}>
                  {formatCurrencyAmount(
                    CurrencyAmount.fromRawAmount(incentive.initialRewardAmount.currency, (rewards ?? 0).toString()),
                    5
                  )}
                </ThemedText.DeprecatedBody>
                <ThemedText.DeprecatedBody fontSize="20px" fontWeight={500}>
                  {incentive.initialRewardAmount.currency.symbol}
                </ThemedText.DeprecatedBody>
              </AutoRow>
            </AutoColumn>
          </DarkerGreyCard>
          <ButtonPrimary disabled={attempting} padding="8px" $borderRadius="12px" onClick={onUnstake}>
            <Trans>Unstake and Claim</Trans>
          </ButtonPrimary>
        </AutoColumn>
      </Wrapper>
    </Modal>
  )
}
