import { useWeb3React } from '@web3-react/core'
import styled, { useTheme } from 'styled-components/macro'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import { useCallback, useEffect, useState } from 'react'
import { usePhysicaTokenFactoryContract } from '../../../hooks/useContract'
import { t, Trans } from '@lingui/macro'
import Modal from '../../Modal'
import { AutoColumn } from '../../Column'
import { AutoRow, RowBetween } from '../../Row'
import { CloseIcon, ThemedText } from '../../../theme'
import { ButtonPrimary } from '../../Button'
import { DarkerGreyCard } from '../../earn/StakingModal'
import { ResizingSmallTextArea, TextInput } from '../../TextInput'
import Slider from '../../Slider'
import useDebouncedChangeHandler from '../../../hooks/useDebouncedChangeHandler'
import { Field } from '../../../state/burn/actions'
import { FileUploadInput } from '../../FileUploadInput'
import { ImageContainer } from '../../../nft/components/collection/Card'
import { ErrorText } from '../../swap/styleds'
import { Text } from 'rebass'

const Wrapper = styled.div`
  width: 100%;
  padding: 20px;
`

const TokenLogoCircular = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.deprecated_bg1};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
`

interface LaunchTokenModalProps {
  isOpen: boolean
  onDismiss: () => void
}

export default function LaunchTokenModal({ isOpen, onDismiss }: LaunchTokenModalProps) {
  const { account } = useWeb3React()
  const theme = useTheme()
  const startDate = Date.now()

  const onUserInput = useCallback((field: Field, typedValue: string) => {
    return typedValue
  }, [])

  const initialSupplyChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput]
  )

  //const rewardCurrency = useToken(incentive.initialRewardAmount.currency.address)

  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [initialBuyAmount, setInitialBuyAmount] = useState('')
  const [tokenLogo, setTokenLogo] = useState<File | null>(null)
  const [tokenLogoPreviewUrl, setTokenLogoPreviewUrl] = useState(null)
  const [tokenLogoError, setTokenLogoError] = useState('')
  const [tokenDescription, setTokenDescription] = useState('')
  const [tokenInitialSupply, setTokenInitialSupply] = useState(1000000000)
  const [tokenInitialSupplySlider, onChangeTokenInitialSupply] = useDebouncedChangeHandler(
    tokenInitialSupply,
    setTokenInitialSupply
  )

  const [tokenMigrationCap, setTokenMigrationCap] = useState(80)
  const [tokenMigrationCapSlider, onChangeTokenMigrationCap] = useDebouncedChangeHandler(
    tokenMigrationCap,
    setTokenMigrationCap
  )

  useEffect(() => {
    if (!tokenLogo) {
      return
    }
    setTokenLogoError('')
    let error = false;
    const reader = new FileReader()

    reader.onloadend = () => {
      // @ts-ignore
      setTokenLogoPreviewUrl(reader.result ?? '')
    }
    if (tokenLogo.size > 1024 * 512) {
      setTokenLogoError('File size must be less than 512KB')
      error = true
    }

    if (!tokenLogo.type.startsWith('image/')) {
      setTokenLogoError('File must be an image')
      error = true
    }
    if(!error) {
      reader.readAsDataURL(tokenLogo)
    }
  }, [tokenLogo])

  const [positionDeposited, setPositionDeposited] = useState(false)
  const weeklyRewards = 0 //incentive.rewardRatePerSecond.multiply(BIG_INT_SECONDS_IN_WEEK)
  const weeklyRewardsUSD = 0 //useStablecoinValue(weeklyRewards)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const staker = usePhysicaTokenFactoryContract()

  async function onLaunchToken() {
    /*if (positionManager && account && staker) {
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
    }*/
  }

  async function onStakePosition() {
    if (staker && account) {
      setAttempting(true)
      /*await staker
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
        })*/
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

  function calculateInitialBuyAmount(initialBuyAmount: string, tokenInitialSupply: number) {
    if (initialBuyAmount == '') {
      return 0
    }
    return ((parseFloat(initialBuyAmount) * tokenInitialSupply) / (parseFloat(initialBuyAmount) + (25000 + 1024))).toFixed(2)
  }

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
              <Trans>New Token Launch</Trans>
            </ThemedText.DeprecatedBody>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <AutoRow gap="md">
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <Trans>Name</Trans>
            </ThemedText.DeprecatedSmall>
            <DarkerGreyCard>
              <TextInput
                onUserInput={setTokenName}
                fontSize={'16'}
                placeholder={'Ethereum'}
                value={tokenName}
              ></TextInput>
            </DarkerGreyCard>
          </AutoRow>
          <AutoRow gap="md">
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <Trans>Symbol</Trans>
            </ThemedText.DeprecatedSmall>
            <DarkerGreyCard>
              <TextInput
                onUserInput={setTokenSymbol}
                fontSize={'16'}
                placeholder={'ETH'}
                value={tokenSymbol}
              ></TextInput>
            </DarkerGreyCard>
          </AutoRow>
          <AutoRow gap="md">
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <Trans>Logo</Trans>
            </ThemedText.DeprecatedSmall>
            <DarkerGreyCard>
              {tokenLogoError != '' ? (
                <ErrorText fontSize="14px" color={theme.accentCritical}>
                  {tokenLogoError}
                </ErrorText>
              ) : (
                <></>
              )}
              {tokenLogoPreviewUrl ? (
                <ImageContainer>
                  <TokenLogoCircular src={tokenLogoPreviewUrl}></TokenLogoCircular>
                </ImageContainer>
              ) : (
                <></>
              )}
              <FileUploadInput onUserInput={setTokenLogo} fontSize={'16'} placeholder={'ETH'}></FileUploadInput>
            </DarkerGreyCard>
          </AutoRow>
          <AutoRow gap="md">
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <Trans>Description</Trans>
            </ThemedText.DeprecatedSmall>
            <DarkerGreyCard>
              <ResizingSmallTextArea
                onUserInput={setTokenDescription}
                fontSize={'16'}
                placeholder={'This token is useful for...'}
                value={tokenDescription}
              ></ResizingSmallTextArea>
            </DarkerGreyCard>
          </AutoRow>
          <AutoRow gap="md">
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <Trans>Initial Supply</Trans>
            </ThemedText.DeprecatedSmall>
            <DarkerGreyCard>
              <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
                {tokenInitialSupplySlider}
              </ThemedText.DeprecatedSmall>
              <Slider
                onChange={onChangeTokenInitialSupply}
                min={1000000000}
                step={1000000000}
                max={1000000000000}
                value={tokenInitialSupplySlider}
              ></Slider>
            </DarkerGreyCard>
          </AutoRow>
          <AutoRow gap="md">
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <Trans>Migration Cap</Trans>
            </ThemedText.DeprecatedSmall>
            <DarkerGreyCard>
              <Slider
                onChange={onChangeTokenMigrationCap}
                min={5}
                step={5}
                max={95}
                value={tokenMigrationCapSlider}
              ></Slider>
              <ThemedText.DeprecatedSmall paddingTop={'5px'} fontSize="14px" fontWeight={600}>
                Launch Physica pool when {tokenMigrationCapSlider}% of tokens are sold.
              </ThemedText.DeprecatedSmall>
            </DarkerGreyCard>
          </AutoRow>
          <AutoRow gap="md">
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <Trans>Choose how many {tokenName} you want to buy</Trans>
            </ThemedText.DeprecatedSmall>
            <DarkerGreyCard>
              <TextInput
                fontSize={'16'}
                onUserInput={setInitialBuyAmount}
                placeholder={'0.0 (optional)'}
                value={initialBuyAmount}
              ></TextInput>
              <ThemedText.DeprecatedSmall paddingTop={'5px'} fontSize="11px" fontWeight={600}>
                You will receive ~{calculateInitialBuyAmount(initialBuyAmount, tokenInitialSupply)} {tokenSymbol}.
              </ThemedText.DeprecatedSmall>
            </DarkerGreyCard>
          </AutoRow>
          {
            <ButtonPrimary disabled={attempting || !account || tokenLogoError != ''} padding="8px" $borderRadius="12px" onClick={onLaunchToken}>
              <Trans>Launch</Trans>
            </ButtonPrimary>
          }
        </AutoColumn>
      </Wrapper>
    </Modal>
  )
}
