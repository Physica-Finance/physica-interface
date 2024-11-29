import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfacePageName } from '@uniswap/analytics-events'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import AddressSection from 'components/LaunchFactory/TokenDetails/AddressSection'
import BalanceSummary from 'components/LaunchFactory/TokenDetails/BalanceSummary'
import { BreadcrumbNavLink } from 'components/LaunchFactory/TokenDetails/BreadcrumbNavLink'
import ChartSection from 'components/LaunchFactory/TokenDetails/ChartSection'
import MobileBalanceSummaryFooter from 'components/LaunchFactory/TokenDetails/MobileBalanceSummaryFooter'
import ShareButton from 'components/LaunchFactory/TokenDetails/ShareButton'
import TokenDetailsSkeleton, {
  Hr,
  LeftPanel,
  RightPanel,
  TokenDetailsLayout,
  TokenInfoContainer,
  TokenNameCell,
} from 'components/LaunchFactory/TokenDetails/Skeleton'
import StatsSection from 'components/LaunchFactory/TokenDetails/StatsSection'
import TokenSafetyModal from 'components/TokenSafety/TokenSafetyModal'
import { getChainInfo } from 'constants/chainInfo'
import { NATIVE_CHAIN_ID, nativeOnChain } from 'constants/tokens'
import { checkWarning } from 'constants/tokenSafety'
import { TokenQueryData2 } from 'graphql/physica/Token'
import { Chain } from 'graphql/data/Token'
import { QueryToken } from 'graphql/physica/Token'
import { CHAIN_NAME_TO_CHAIN_ID, getLaunchFactoryTokenDetailsURL } from 'graphql/physica/util'
import { useIsUserAddedTokenOnChain } from 'hooks/Tokens'
import { useOnGlobalChainSwitch } from 'hooks/useGlobalChainSwitch'
import { UNKNOWN_TOKEN_SYMBOL, useTokenFromActiveNetwork } from 'lib/hooks/useCurrency'
import React, { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { ArrowLeft } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'
import { isAddress } from 'utils'

import { OnChangeTimePeriod } from './ChartSection'
import InvalidTokenDetails from './InvalidTokenDetails'
import { useMetaManagerContract, usePhysicaTokenFactoryContract } from '../../../hooks/useContract'
import { fetchMetaFromPinataIPFS } from '../utils'
import { AboutSection } from './About'
import { LaunchpadTokenQuery } from '../../../graphql/physicalaunchfactory/LaunchFactoryToken'
import { formatWeiToDecimal } from '../../../nft/utils'
import { AutoRow, RowFixed } from '../../Row'
import { ThemedText } from '../../../theme'
import { darken, transparentize } from 'polished'
import CurrencyInputPanel from '../../CurrencyInputPanel'
import { ButtonPrimary } from '../../Button'
import { SellTokenModal, BuyTokenModal } from '../LaunchTokenModal'
import useCurrencyBalance from '../../../lib/hooks/useCurrencyBalance'

const TokenLogoCircular = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.deprecated_bg1};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
`
const TokenSymbol = styled.span`
  text-transform: uppercase;
  color: ${({ theme }) => theme.textSecondary};
`
const TokenActions = styled.div`
  display: flex;
  gap: 16px;
  color: ${({ theme }) => theme.textSecondary};
`
const BarWrapper = styled.div`
  width: 100%;
  height: calc(5% - 8px);
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

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  border-radius: 12px;

  padding: 6px 8px;
  flex: 1 1 auto;
  width: 100%;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 100%;
  `};
`

function useOnChainToken(address: string | undefined, skip: boolean) {
  const token = useTokenFromActiveNetwork(skip || !address ? undefined : address)

  if (skip || !address || (token && token?.symbol === UNKNOWN_TOKEN_SYMBOL)) {
    return undefined
  } else {
    return token
  }
}

// Selects most relevant token based on data available, preferring native > query > on-chain
// Token will be null if still loading from on-chain, and undefined if unavailable
function useRelevantToken(
  address: string | undefined,
  pageChainId: number,
  tokenQueryData: TokenQueryData2 | undefined
) {
  const { chainId: activeChainId } = useWeb3React()
  const queryToken = useMemo(() => {
    if (!address) return undefined
    if (address === NATIVE_CHAIN_ID) return nativeOnChain(pageChainId)
    if (tokenQueryData) return new QueryToken(address, tokenQueryData)
    return undefined
  }, [pageChainId, address, tokenQueryData])
  // fetches on-chain token if query data is missing and page chain matches global chain (else fetch won't work)
  const skipOnChainFetch = Boolean(queryToken) || pageChainId !== activeChainId
  const onChainToken = useOnChainToken(address, skipOnChainFetch)

  return useMemo(
    () => ({ token: queryToken ?? onChainToken, didFetchFromChain: !queryToken }),
    [onChainToken, queryToken]
  )
}

type TokenDetailsProps = {
  urlAddress: string | undefined
  chain: Chain
  tokenQuery: LaunchpadTokenQuery
  referralAddress: string | undefined
  tokenPriceQuery: LaunchpadTokenQuery | undefined
  onChangeTimePeriod: OnChangeTimePeriod
}
export default function LaunchFactoryTokenDetailsTokenDetails({
  urlAddress,
  chain,
  tokenQuery,
  referralAddress,
  tokenPriceQuery,
  onChangeTimePeriod,
}: TokenDetailsProps) {
  if (!urlAddress) {
    throw new Error('Invalid token details route: tokenAddress param is undefined')
  }
  const address = useMemo(
    () => (urlAddress === NATIVE_CHAIN_ID ? urlAddress : isAddress(urlAddress) || undefined),
    [urlAddress]
  )
  const { account } = useWeb3React()
  const pageChainId = CHAIN_NAME_TO_CHAIN_ID[chain]

  const tokenQueryData = tokenQuery.token

  const { token, didFetchFromChain } = useRelevantToken(address, pageChainId, tokenQueryData)

  const tokenWarning = address ? checkWarning(address) : null
  const isBlockedToken = tokenWarning?.canProceed === false
  const navigate = useNavigate()

  // Wrapping navigate in a transition prevents Suspense from unnecessarily showing fallbacks again.
  const [isPending, startTokenTransition] = useTransition()
  const navigateToTokenForChain = useCallback(
    (update: Chain) => {
      if (!address) return
      startTokenTransition(() => navigate(getLaunchFactoryTokenDetailsURL({ id: address })))
    },
    [address, chain, didFetchFromChain, navigate, token?.isNative]
  )
  useOnGlobalChainSwitch(navigateToTokenForChain)

  const navigateToWidgetSelectedToken = useCallback(
    (token: Currency) => {
      const address = token.isNative ? NATIVE_CHAIN_ID : token.address
      startTokenTransition(() => navigate(getLaunchFactoryTokenDetailsURL({ id: address })))
    },
    [chain, navigate]
  )

  const [continueSwap, setContinueSwap] = useState<{ resolve: (value: boolean | PromiseLike<boolean>) => void }>()

  const [openTokenSafetyModal, setOpenTokenSafetyModal] = useState(false)

  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showSellModal, setShowSellModal] = useState(false)
  const [plqAmount, setPlqAmount] = useState<string>('0')
  const [tokenAmount, setTokenAmount] = useState<string>('0')
  const [metaEntry, setMetaEntry] = useState<string | undefined>(undefined)
  const [metaJson, setMetaJson] = useState<any | undefined>(undefined)
  const [percentageRemaining, setPercentageRemaining] = useState(0)
  const [tokenState, setTokenState] = useState<any | undefined>(undefined)
  const [tokenVirtualPlqStart, setTokenVirtualPlqStart] = useState<string | undefined>(undefined)
  const metaManager = useMetaManagerContract()
  const physicaTokenFactory = usePhysicaTokenFactoryContract()
  const balance = useCurrencyBalance(account, token ?? undefined)

  // Show token safety modal if Swap-reviewing a warning token, at all times if the current token is blocked
  const shouldShowSpeedbump = !useIsUserAddedTokenOnChain(address, pageChainId) && tokenWarning !== null
  const onReviewSwapClick = useCallback(
    () => new Promise<boolean>((resolve) => (shouldShowSpeedbump ? setContinueSwap({ resolve }) : resolve(true))),
    [shouldShowSpeedbump]
  )

  const onResolveSwap = useCallback(
    (value: boolean) => {
      continueSwap?.resolve(value)
      setContinueSwap(undefined)
    },
    [continueSwap, setContinueSwap]
  )

  if (!metaJson) {
    fetchMetaFromPinataIPFS(tokenQueryData?.ipfsHash ?? '').then((meta) => setMetaJson(meta))
  }

  physicaTokenFactory?.tokenStates(token?.wrapped.address ?? '0x0').then((tokenState) => setTokenState(tokenState))

  useEffect(() => {
    if (tokenState) {
      const tokenHolding = parseFloat(BigInt(tokenState.tokenHolding).toString())
      const initialSupply = parseFloat(BigInt(tokenState.initialSupply).toString())
      const migrationCap = parseFloat(BigInt(tokenState.migrationCap).toString())
      setTokenVirtualPlqStart(tokenState.virtualPlqStart.toString())
      console.log('tokenHolding', tokenHolding)
      console.log('initialSupply', initialSupply)
      console.log('migrationCap', migrationCap)
      setPercentageRemaining(migrationCap/100 / (tokenHolding / initialSupply))
    }
  }, [tokenState])

  const [price, setPrice] = useState('')
  if (token?.wrapped.address) {
    physicaTokenFactory?.getPrice(token?.wrapped.address).then((response: any) => {
      setPrice(response)
    })
  }

  // address will never be undefined if token is defined; address is checked here to appease typechecker
  if (token === undefined || !address) {
    return <InvalidTokenDetails chainName={address && getChainInfo(pageChainId)?.label} />
  }
  return (
    <>
      <BuyTokenModal
        isOpen={showBuyModal}
        onDismiss={() => setShowBuyModal(false)}
        token={token}
        referralAddress={referralAddress}
        plqAmount={plqAmount}
        price={price}
      />
      <SellTokenModal
        isOpen={showSellModal}
        onDismiss={() => setShowSellModal(false)}
        token={token}
        tokenAmount={tokenAmount}
        price={price}
      />
      <Trace
        page={InterfacePageName.TOKEN_DETAILS_PAGE}
        properties={{ tokenAddress: address, tokenName: token?.name }}
        shouldLogImpression
      >
        <TokenDetailsLayout>
          {token && !isPending ? (
            <LeftPanel>
              <BreadcrumbNavLink to={`/launchpad/${chain.toLowerCase()}`}>
                <ArrowLeft data-testid="token-details-return-button" size={14} /> Tokens
              </BreadcrumbNavLink>
              <TokenInfoContainer data-testid="token-info-container">
                <TokenNameCell>
                  <TokenLogoCircular src={'https://gateway.pinata.cloud/ipfs/' + metaJson?.image} />
                  {token.name ?? <Trans>Name not found</Trans>}
                  <TokenSymbol>{token.symbol ?? <Trans>Symbol not found</Trans>}</TokenSymbol>
                </TokenNameCell>
                <TokenActions>
                  <ShareButton currency={token} />
                </TokenActions>
              </TokenInfoContainer>
              <ChartSection tokenPriceQuery={tokenPriceQuery} onChangeTimePeriod={onChangeTimePeriod} />
              <StatsSection
                TVL={formatWeiToDecimal(
                  (BigInt(tokenQueryData?.plqAmount ?? 0) - BigInt(tokenVirtualPlqStart ?? 0)).toString()

                )}
                volume24H={tokenQueryData?.txCount ?? '0'}
                priceHigh52W={parseFloat('0')}
                priceLow52W={parseFloat('0')}
              />
              {!token.isNative && <AddressSection address={address} />}
              <Hr />
              <AboutSection
                address={address}
                chainId={pageChainId}
                description={metaJson?.description}
                homepageUrl={metaJson?.website}
                twitterName={metaJson?.twitter}
                telegramName={metaJson?.telegram}
              />
            </LeftPanel>
          ) : (
            <TokenDetailsSkeleton />
          )}

          <RightPanel onClick={() => isBlockedToken && setOpenTokenSafetyModal(true)}>
            <div style={{ pointerEvents: isBlockedToken ? 'none' : 'auto' }}>
              {/*<Widget
              defaultTokens={{
                default: token ?? undefined,
              }}
              onDefaultTokenChange={navigateToWidgetSelectedToken}
              onReviewSwapClick={onReviewSwapClick}
            />*/}
            </div>
            <ThemedText.DeprecatedSmall>
              <Trans>Pool Migration Progress</Trans>
            </ThemedText.DeprecatedSmall>
            <BarWrapper>
              <Bar percent={percentageRemaining}>
                <RowFixed>
                  <ThemedText.DeprecatedBody fontSize="12px" fontWeight={600} ml="8px" mt="-2px">
                    {percentageRemaining.toFixed(2)}%
                  </ThemedText.DeprecatedBody>
                </RowFixed>
              </Bar>
            </BarWrapper>
            <CurrencyInputPanel
              value={plqAmount}
              onUserInput={setPlqAmount}
              showMaxButton={false}
              currency={nativeOnChain(7070)}
              id={'0'}
            />
            <ThemedText.DeprecatedSmall>
              You will receive {(parseFloat(plqAmount) / parseFloat(price)) * 1e18} {token?.symbol} for {plqAmount} PLQ
            </ThemedText.DeprecatedSmall>
            <AutoRow justify={'space-between'}>
              <ResponsiveButtonPrimary onClick={() => setShowBuyModal(true)}>
                <Trans>Buy</Trans>
              </ResponsiveButtonPrimary>
            </AutoRow>
            <CurrencyInputPanel
              value={tokenAmount}
              onUserInput={setTokenAmount}
              showMaxButton={true}
              onMax={() => setTokenAmount(balance?.toExact() ?? '0')}
              currency={token}
              id={'1'}

            />
            <AutoRow justify={'stretch'}>
              <ResponsiveButtonPrimary onClick={() => setShowSellModal(true)}>
                <Trans>Sell</Trans>
              </ResponsiveButtonPrimary>
            </AutoRow>

            {token && <BalanceSummary token={token} />}
          </RightPanel>
          {token && <MobileBalanceSummaryFooter token={token} buyModal={setShowBuyModal} sellModal={setShowSellModal} />}

          <TokenSafetyModal
            isOpen={openTokenSafetyModal || !!continueSwap}
            tokenAddress={address}
            onContinue={() => onResolveSwap(true)}
            onBlocked={() => {
              setOpenTokenSafetyModal(false)
            }}
            onCancel={() => onResolveSwap(false)}
            showCancel={true}
          />
        </TokenDetailsLayout>
      </Trace>
    </>
  )
}
