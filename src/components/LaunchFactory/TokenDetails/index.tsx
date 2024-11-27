import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfacePageName } from '@uniswap/analytics-events'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
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
  TokenNameCell
} from 'components/LaunchFactory/TokenDetails/Skeleton'
import StatsSection from 'components/LaunchFactory/TokenDetails/StatsSection'
import TokenSafetyMessage from 'components/TokenSafety/TokenSafetyMessage'
import TokenSafetyModal from 'components/TokenSafety/TokenSafetyModal'
import Widget from 'components/Widget'
import { getChainInfo } from 'constants/chainInfo'
import { NATIVE_CHAIN_ID, nativeOnChain } from 'constants/tokens'
import { checkWarning } from 'constants/tokenSafety'
import { TokenPriceQuery2 } from 'graphql/physica/TokenPrice'
import { TokenQuery2, TokenQueryData2 } from 'graphql/physica/Token'
import { Chain } from 'graphql/data/Token'
import { QueryToken } from 'graphql/physica/Token'
import { CHAIN_NAME_TO_CHAIN_ID, getLaunchFactoryTokenDetailsURL } from 'graphql/physica/util'
import { useIsUserAddedTokenOnChain } from 'hooks/Tokens'
import { useOnGlobalChainSwitch } from 'hooks/useGlobalChainSwitch'
import { UNKNOWN_TOKEN_SYMBOL, useTokenFromActiveNetwork } from 'lib/hooks/useCurrency'
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { ArrowLeft } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'
import { isAddress } from 'utils'

import { OnChangeTimePeriod } from './ChartSection'
import InvalidTokenDetails from './InvalidTokenDetails'
import { useMetaManagerContract } from '../../../hooks/useContract'
import { getMultihashFromContractResponse } from '../../../utils/multihash'
import { fetchMetaFromPinataIPFS } from '../utils'
import { AboutSection } from './About'
import { LaunchpadTokenQuery } from '../../../graphql/physicalaunchfactory/LaunchFactoryToken'
import { formatWeiToDecimal } from '../../../nft/utils'
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

  const [metaEntry, setMetaEntry] = useState<string | undefined>(undefined)
  const [metaJson, setMetaJson] = useState<any | undefined>(undefined)
  const metaManager = useMetaManagerContract()

  metaManager?.getEntry(address!).then((entry) => {
    setMetaEntry(getMultihashFromContractResponse(entry) ?? undefined)
  })

  useEffect(() => {
    fetchMetaFromPinataIPFS(metaEntry ?? '').then((meta) => setMetaJson(meta))
  }, [metaEntry])

  // address will never be undefined if token is defined; address is checked here to appease typechecker
  if (token === undefined || !address) {
    return <InvalidTokenDetails chainName={address && getChainInfo(pageChainId)?.label} />
  }
  return (
    <Trace
      page={InterfacePageName.TOKEN_DETAILS_PAGE}
      properties={{ tokenAddress: address, tokenName: token?.name }}
      shouldLogImpression
    >
      <TokenDetailsLayout>
        {token && !isPending ? (
          <LeftPanel>
            <BreadcrumbNavLink to={`/tokens/${chain.toLowerCase()}`}>
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
              TVL={formatWeiToDecimal(tokenQueryData?.plqAmount ?? '0')}
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
          {tokenWarning && <TokenSafetyMessage tokenAddress={address} warning={tokenWarning} />}

          {token && <BalanceSummary token={token} />}
        </RightPanel>
        {token && <MobileBalanceSummaryFooter token={token} />}

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
  )
}
