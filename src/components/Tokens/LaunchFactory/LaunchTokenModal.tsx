import { useWeb3React } from '@web3-react/core'
import styled, { useTheme } from 'styled-components/macro'
import { useTransactionAdder } from '../../../state/transactions/hooks'
import React, { useEffect, useState } from 'react'
import { usePhysicaTokenFactoryContract } from '../../../hooks/useContract'
import { t, Trans } from '@lingui/macro'
import Modal from '../../Modal'
import { AutoColumn } from '../../Column'
import { AutoRow, RowBetween } from '../../Row'
import { CloseIcon, StyledLink, ThemedText } from '../../../theme'
import { ButtonPrimary } from '../../Button'
import { DarkerGreyCard } from '../../earn/StakingModal'
import { ResizingSmallTextArea, TextInput } from '../../TextInput'
import Slider from '../../Slider'
import useDebouncedChangeHandler from '../../../hooks/useDebouncedChangeHandler'
import { FileUploadInput } from '../../FileUploadInput'
import { ImageContainer } from '../../../nft/components/collection/Card'
import { ErrorText } from '../../swap/styleds'
import { ChevronDown, ChevronUp } from 'react-feather'
import { getBytes32FromMultiash } from '../../../utils/multihash'
import { TransactionType } from '../../../state/transactions/types'
import { numberToWei } from '../../../nft/utils'
import { base64 } from 'ethers/lib/utils'
import Loader from '../../Loader'

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
  const physicaTokenFactory = usePhysicaTokenFactoryContract()
  const theme = useTheme()
  const startDate = Date.now()

  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  const [showAdvanced, setShowAdvanced] = useState(false) // required
  const [tokenName, setTokenName] = useState('') // required
  const [tokenNameError, setTokenNameError] = useState('')

  const [tokenSymbol, setTokenSymbol] = useState('') // required
  const [tokenSymbolError, setTokenSymbolError] = useState('')

  const [tokenWebsite, setTokenWebsite] = useState('') // optional
  const [tokenTwitter, setTokenTwitter] = useState('') // optional
  const [tokenTelegram, setTokenTelegram] = useState('') // optional
  const [initialBuyAmount, setInitialBuyAmount] = useState('') // required

  const [tokenLogo, setTokenLogo] = useState<File | null>(null) // required
  const [tokenLogoPreviewUrl, setTokenLogoPreviewUrl] = useState(null)
  const [tokenLogoError, setTokenLogoError] = useState('')

  const [tokenDescription, setTokenDescription] = useState('') // required
  const [tokenDescriptionError, setTokenDescriptionError] = useState('')

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

  function toggleShowAdvanced(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    setShowAdvanced(!showAdvanced)
  }

  useEffect(() => {
    if (tokenName == '') {
      setTokenNameError('Name is required')
      return
    }

    if (tokenName.length > 20) {
      setTokenNameError('Name must be less than 20 characters')
      return
    }

    setTokenNameError('')
  }, [tokenName])

  useEffect(() => {
    if (tokenSymbol == '') {
      setTokenSymbolError('Symbol is required')
      return
    }

    if (tokenSymbol.length > 5) {
      setTokenSymbolError('Symbol must be less than 5 characters')
      return
    }

    setTokenSymbolError('')
  }, [tokenSymbol])

  useEffect(() => {
    if (tokenDescription == '') {
      setTokenDescriptionError('Description is required')
      return
    }

    if (tokenDescription.length > 200) {
      setTokenDescriptionError('Description must be less than 200 characters')
      return
    }

    setTokenDescriptionError('')
  }, [tokenDescription])

  useEffect(() => {
    if (!tokenLogo) {
      return
    }
    setTokenLogoError('')
    let error = false
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

    if (
      tokenLogo.type !== 'image/jpeg' &&
      tokenLogo.type !== 'image/png' &&
      tokenLogo.type !== 'image/jpg' &&
      tokenLogo.type !== 'image/gif'
    ) {
      setTokenLogoError('File must be a jpeg, png, jpg, or gif')
      error = true
    }

    if (!error) {
      reader.readAsDataURL(tokenLogo)
    }
  }, [tokenLogo])

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  async function onLaunchToken() {
    if (!account || !tokenLogo || !physicaTokenFactory) {
      return
    }
    setAttempting(true)
    //const res = await fetch('https://planq.network/api/ipfs-image', {
    const res = await fetch('http://localhost:3001/api/ipfs-image', {
      headers: {
        Accept: tokenLogo.type,
        'Content-Type': tokenLogo.type,
      },
      method: 'POST',
      body: base64.encode(new Uint8Array(await tokenLogo.arrayBuffer())),
    })
    if (!res.ok) {
      setTokenLogoError('Failed to upload logo')
      return
    }

    const logoIpfsHash = await res.text()

    //const metaRes = await fetch('https://planq.network/api/ipfs-meta', {
    const metaRes = await fetch('http://localhost:3001/api/ipfs-meta', {
      headers: {
        Accept: 'multipart/form-data',
        'Content-Type': 'multipart/form-data',
      },
      method: 'POST',
      body: JSON.stringify({
        name: tokenName,
        description: tokenDescription,
        symbol: tokenSymbol,
        image: logoIpfsHash,
        website: tokenWebsite,
        twitter: tokenTwitter,
        telegram: tokenTelegram,
        dev: account,
      }),
    })
    if (!metaRes.ok) {
      setTokenLogoError('Failed to upload metadata')
      return
    }
    const metaIpfsHash = await metaRes.text()
    const multihashMetaIpfsHash = getBytes32FromMultiash(metaIpfsHash)


    await physicaTokenFactory
      .createToken(
        tokenName,
        tokenSymbol,
        tokenMigrationCap,
        numberToWei(tokenInitialSupply),
        multihashMetaIpfsHash.digest,
        multihashMetaIpfsHash.hashFunction,
        multihashMetaIpfsHash.size,
        { gasLimit: 3500000, value: numberToWei(parseFloat(initialBuyAmount == '' ? '0' : initialBuyAmount)) }
      )
      .then((response: any) => {
        addTransaction(response, {
          type: TransactionType.LAUNCH_TOKEN,
          tokenName,
          tokenSymbol,
        })
        setHash(response.hash)
      })
      .catch((error: any) => {
        setAttempting(false)
        console.log(error)
      })
  }

  function calculateInitialBuyAmount(initialBuyAmount: string, tokenInitialSupply: number) {
    if (initialBuyAmount == '') {
      return 0
    }
    return (
      (parseFloat(initialBuyAmount) * tokenInitialSupply) /
      (parseFloat(initialBuyAmount) + (25000 + 1024))
    ).toFixed(2)
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
              {tokenNameError != '' ? (
                <ErrorText fontSize="14px" color={theme.accentCritical}>
                  {tokenNameError}
                </ErrorText>
              ) : (
                <></>
              )}
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
              {tokenSymbolError != '' ? (
                <ErrorText fontSize="14px" color={theme.accentCritical}>
                  {tokenSymbolError}
                </ErrorText>
              ) : (
                <></>
              )}
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
              {tokenDescriptionError != '' ? (
                <ErrorText fontSize="14px" color={theme.accentCritical}>
                  {tokenDescriptionError}
                </ErrorText>
              ) : (
                <></>
              )}
              <ResizingSmallTextArea
                onUserInput={setTokenDescription}
                fontSize={'16'}
                placeholder={'This token is useful for...'}
                value={tokenDescription}
              ></ResizingSmallTextArea>
              {tokenDescription.length > 200 ? (
                <ErrorText fontSize="14px" color={theme.accentCritical}>
                  {tokenDescription.length}/200
                </ErrorText>
              ) : (
                <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
                  {tokenDescription.length}/200
                </ThemedText.DeprecatedSmall>
              )}
            </DarkerGreyCard>
          </AutoRow>
          <AutoRow gap="md">
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <Trans>Website (optional)</Trans>
            </ThemedText.DeprecatedSmall>
            <DarkerGreyCard>
              <TextInput
                onUserInput={setTokenWebsite}
                fontSize={'16'}
                placeholder={'https://example.com'}
                value={tokenWebsite}
              ></TextInput>
            </DarkerGreyCard>
          </AutoRow>
          <AutoRow gap="md">
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <Trans>Twitter (optional)</Trans>
            </ThemedText.DeprecatedSmall>
            <DarkerGreyCard>
              <TextInput
                onUserInput={setTokenTwitter}
                fontSize={'16'}
                placeholder={'https://twitter.com/example'}
                value={tokenTwitter}
              ></TextInput>
            </DarkerGreyCard>
          </AutoRow>
          <AutoRow gap="md">
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <Trans>Telegram (optional)</Trans>
            </ThemedText.DeprecatedSmall>
            <DarkerGreyCard>
              <TextInput
                onUserInput={setTokenTelegram}
                fontSize={'16'}
                placeholder={'https://t.me/example'}
                value={tokenTelegram}
              ></TextInput>
            </DarkerGreyCard>
          </AutoRow>
          <AutoRow>
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <StyledLink target={''} rel={'Show Advanced'} href={'#'} onClick={toggleShowAdvanced}>
                {!showAdvanced ? 'Show' : 'Hide'} Advanced
              </StyledLink>
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </ThemedText.DeprecatedSmall>
          </AutoRow>
          {showAdvanced ? (
            <>
              {' '}
              <AutoRow gap="md">
                <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
                  <Trans>Initial Supply</Trans>
                </ThemedText.DeprecatedSmall>
                <DarkerGreyCard>
                  <ThemedText.DeprecatedSmall
                    paddingLeft={'5px'}
                    paddingBottom={'5px'}
                    fontSize="14px"
                    fontWeight={600}
                  >
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
            </>
          ) : (
            <></>
          )}
          <AutoRow gap="md">
            <ThemedText.DeprecatedSmall paddingLeft={'5px'} paddingBottom={'5px'} fontSize="14px" fontWeight={600}>
              <Trans>Choose how many {tokenName} you want to buy (optional)</Trans>
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
            <ButtonPrimary
              disabled={
                attempting ||
                !account ||
                tokenLogoError != '' ||
                tokenNameError != '' ||
                tokenSymbolError != '' ||
                tokenDescriptionError != ''
              }
              padding="8px"
              $borderRadius="12px"
              onClick={onLaunchToken}
            >
              {attempting ? <><Trans>Launching</Trans><Loader/></> : (<Trans>Launch</Trans>)}
            </ButtonPrimary>
          }
        </AutoColumn>
      </Wrapper>
    </Modal>
  )
}
