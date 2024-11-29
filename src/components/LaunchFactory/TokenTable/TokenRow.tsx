import { Trans } from '@lingui/macro'
import { sendAnalyticsEvent } from '@uniswap/analytics'
import { InterfaceEventName } from '@uniswap/analytics-events'
import { MouseoverTooltip } from 'components/Tooltip'
import { SparklineMap } from 'graphql/physicalaunchfactory/LaunchFactoryTokens'
import { CHAIN_NAME_TO_CHAIN_ID, getLaunchFactoryTokenDetailsURL } from 'graphql/physica/util'
import { useAtomValue } from 'jotai/utils'
import React, { CSSProperties, ForwardedRef, forwardRef, ReactNode, useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Info } from 'react-feather'
import { Link, useParams } from 'react-router-dom'
import styled, { css, useTheme } from 'styled-components/macro'
import { ClickableStyle } from 'theme/components/index'

import {
  LARGE_MEDIA_BREAKPOINT,
  MAX_WIDTH_MEDIA_BREAKPOINT,
  MEDIUM_MEDIA_BREAKPOINT,
  SMALL_MEDIA_BREAKPOINT,
} from '../constants'
import { LoadingBubble } from '../loading'
import {
  filterStringAtom,
  filterTimeAtom,
  sortAscendingAtom,
  sortMethodAtom,
  TokenSortMethod,
  useSetSortMethod,
} from '../state'
import { formatDelta, getDeltaArrow } from '../TokenDetails/PriceChart'
import { LaunchpadToken } from '../../../graphql/physicalaunchfactory/LaunchFactoryTokens'
import { useMetaManagerContract, usePhysicaTokenFactoryContract } from '../../../hooks/useContract'
import { fetchMetaFromPinataIPFS } from '../utils'
import { ImageContainer } from '../../../nft/components/collection/Card'
import { RowFixed } from '../../Row'
import theme, { ThemedText } from '../../../theme'
import { darken, transparentize } from 'polished'
import CurrencyLogo from '../../Logo/CurrencyLogo'

const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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
const StyledTokenRow = styled.div<{
  first?: boolean
  last?: boolean
  loading?: boolean
}>`
  background-color: transparent;
  display: grid;
  font-size: 16px;
  grid-template-columns: 1fr 7fr 4fr 4fr 4fr 4fr;
  line-height: 24px;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  min-width: 390px;
  ${({ first, last }) => css`
    height: ${first || last ? '72px' : '64px'};
    padding-top: ${first ? '8px' : '0px'};
    padding-bottom: ${last ? '8px' : '0px'};
  `}
  padding-left: 12px;
  padding-right: 12px;
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => css`background-color ${duration.medium} ${timing.ease}`};
  width: 100%;
  transition-duration: ${({ theme }) => theme.transition.duration.fast};

  &:hover {
    ${({ loading, theme }) =>
      !loading &&
      css`
        background-color: ${theme.hoverDefault};
      `}
    ${({ last }) =>
      last &&
      css`
        border-radius: 0px 0px 8px 8px;
      `}
  }

  @media only screen and (max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 6.5fr 4.5fr 4.5fr 4.5fr 4.5fr;
  }

  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 7.5fr 4.5fr 4.5fr 4.5fr;
  }

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 10fr 5fr 5fr;
  }

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    grid-template-columns: 2fr 3fr;
    min-width: unset;
    border-bottom: 0.5px solid ${({ theme }) => theme.backgroundModule};

    :last-of-type {
      border-bottom: none;
    }
  }
`

const ClickableContent = styled.div`
  display: flex;
  text-decoration: none;
  color: ${({ theme }) => theme.textPrimary};
  align-items: center;
  cursor: pointer;
`
const ClickableName = styled(ClickableContent)`
  gap: 8px;
  max-width: 100%;
`
const StyledHeaderRow = styled(StyledTokenRow)`
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.backgroundOutline};
  border-radius: 8px 8px 0px 0px;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  height: 48px;
  line-height: 16px;
  padding: 0px 12px;
  width: 100%;
  justify-content: center;

  &:hover {
    background-color: transparent;
  }

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    justify-content: space-between;
  }
`

const ListNumberCell = styled(Cell)<{ header: boolean }>`
  color: ${({ theme }) => theme.textSecondary};
  min-width: 32px;
  font-size: 14px;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const DataCell = styled(Cell)<{ sortable: boolean }>`
  justify-content: flex-end;
  min-width: 80px;
  user-select: ${({ sortable }) => (sortable ? 'none' : 'unset')};
  transition: ${({
    theme: {
      transition: { duration, timing },
    },
  }) => css`background-color ${duration.medium} ${timing.ease}`};
`
const TvlCell = styled(DataCell)`
  padding-right: 8px;
  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const NameCell = styled(Cell)`
  justify-content: flex-start;
  padding: 0px 8px;
  min-width: 240px;
  gap: 8px;
`
const PriceCell = styled(DataCell)`
  padding-right: 8px;
`
const PercentChangeCell = styled(DataCell)`
  padding-right: 8px;
  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const PercentChangeInfoCell = styled(Cell)`
  display: none;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    display: flex;
    justify-content: flex-end;
    color: ${({ theme }) => theme.textSecondary};
    font-size: 12px;
    line-height: 16px;
  }
`
const PriceInfoCell = styled(Cell)`
  justify-content: flex-end;
  flex: 1;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    flex-direction: column;
    align-items: flex-end;
  }
`

const HeaderCellWrapper = styled.span<{ onClick?: () => void }>`
  align-items: center;
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'unset')};
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  width: 100%;

  &:hover {
    ${ClickableStyle}
  }
`
const SparkLineCell = styled(Cell)`
  padding: 0px 24px;
  min-width: 120px;

  @media only screen and (max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const SparkLine = styled(Cell)`
  width: 124px;
  height: 42px;
`
const StyledLink = styled(Link)`
  text-decoration: none;
`
const TokenInfoCell = styled(Cell)`
  gap: 8px;
  line-height: 24px;
  font-size: 16px;
  max-width: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    justify-content: flex-start;
    flex-direction: column;
    gap: 0px;
    width: max-content;
    font-weight: 500;
  }
`
const TokenName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`
const TokenSymbol = styled(Cell)`
  color: ${({ theme }) => theme.textTertiary};
  text-transform: uppercase;

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    font-size: 12px;
    height: 16px;
    justify-content: flex-start;
    width: 100%;
  }
`
const VolumeCell = styled(DataCell)`
  padding-right: 8px;
  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    display: none;
  }
`

const TokenLogoCircular = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.deprecated_bg1};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
`
const SmallLoadingBubble = styled(LoadingBubble)`
  width: 25%;
`
const MediumLoadingBubble = styled(LoadingBubble)`
  width: 65%;
`
const LongLoadingBubble = styled(LoadingBubble)`
  width: 90%;
`
const IconLoadingBubble = styled(LoadingBubble)`
  border-radius: 50%;
  width: 24px;
`
export const SparkLineLoadingBubble = styled(LongLoadingBubble)`
  height: 4px;
`

const InfoIconContainer = styled.div`
  margin-left: 2px;
  display: flex;
  align-items: center;
  cursor: help;
`

export const HEADER_DESCRIPTIONS: Record<TokenSortMethod, ReactNode | undefined> = {
  [TokenSortMethod.PRICE]: undefined,
  [TokenSortMethod.CREATOR]: undefined,
  [TokenSortMethod.TOTAL_VALUE_LOCKED]: (
    <Trans>
      The migration % is the percentage needed for this token to migrate to a Physica pool.
    </Trans>
  ),
  [TokenSortMethod.TXS]: (
    <Trans>Volume is the amount of the asset that has been traded on Physica during the selected time frame.</Trans>
  ),
}

/* Get singular header cell for header row */
function HeaderCell({
  category,
}: {
  category: TokenSortMethod // TODO: change this to make it work for trans
}) {
  const theme = useTheme()
  const sortAscending = useAtomValue(sortAscendingAtom)
  const handleSortCategory = useSetSortMethod(category)
  const sortMethod = useAtomValue(sortMethodAtom)

  const description = HEADER_DESCRIPTIONS[category]

  return (
    <HeaderCellWrapper onClick={handleSortCategory}>
      {sortMethod === category && (
        <>
          {sortAscending ? (
            <ArrowUp size={20} strokeWidth={1.8} color={theme.accentActive} />
          ) : (
            <ArrowDown size={20} strokeWidth={1.8} color={theme.accentActive} />
          )}
        </>
      )}
      {category}
      {description && (
        <MouseoverTooltip text={description} placement="right">
          <InfoIconContainer>
            <Info size={14} />
          </InfoIconContainer>
        </MouseoverTooltip>
      )}
    </HeaderCellWrapper>
  )
}

/* Token Row: skeleton row component */
function TokenRow({
  header,
  listNumber,
  tokenInfo,
  price,
  percentChange,
  tvl,
  volume,
  sparkLine,
  ...rest
}: {
  first?: boolean
  header: boolean
  listNumber: ReactNode
  loading?: boolean
  tvl: ReactNode
  price: ReactNode
  percentChange: ReactNode
  sparkLine?: ReactNode
  tokenInfo: ReactNode
  volume: ReactNode
  last?: boolean
  style?: CSSProperties
}) {
  const rowCells = (
    <>
      <ListNumberCell header={header}>{listNumber}</ListNumberCell>
      <NameCell data-testid="name-cell">{tokenInfo}</NameCell>
      <PercentChangeCell data-testid="percent-change-cell" sortable={header}>
        {percentChange}
      </PercentChangeCell>
      <TvlCell data-testid="tvl-cell" sortable={header}>
        {tvl}
      </TvlCell>
      <VolumeCell data-testid="volume-cell" sortable={header}>
        {volume}
      </VolumeCell>
      <PriceCell data-testid="price-cell" sortable={header}>
        {price}
      </PriceCell>
    </>
  )
  if (header) return <StyledHeaderRow data-testid="header-row">{rowCells}</StyledHeaderRow>
  return <StyledTokenRow {...rest}>{rowCells}</StyledTokenRow>
}

/* Header Row: top header row component for table */
export function HeaderRow() {
  return (
    <TokenRow
      header={true}
      listNumber="#"
      tokenInfo={<Trans>Token name</Trans>}
      price={<HeaderCell category={TokenSortMethod.PRICE} />}
      percentChange={<HeaderCell category={TokenSortMethod.CREATOR} />}
      tvl={<HeaderCell category={TokenSortMethod.TOTAL_VALUE_LOCKED} />}
      volume={<HeaderCell category={TokenSortMethod.TXS} />}
    />
  )
}

function timeSince(date: Date): string {
  const seconds = Math.floor((new Date() - date) / 1000)

  let interval = seconds / 31536000

  if (interval > 1) {
    return Math.floor(interval) + ' yrs ago'
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + ' months ago'
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + 'd ago'
  }
  interval = seconds / 3600
  if (interval > 1) {
    return Math.floor(interval) + 'h ago'
  }
  interval = seconds / 60
  if (interval > 1) {
    return Math.floor(interval) + 'm ago'
  }
  return Math.floor(seconds) + 's ago'
}

/* Loading State: row component with loading bubbles */
export function LoadingRow(props: { first?: boolean; last?: boolean }) {
  return (
    <TokenRow
      header={false}
      listNumber={<SmallLoadingBubble />}
      loading
      tokenInfo={
        <>
          <IconLoadingBubble />
          <MediumLoadingBubble />
        </>
      }
      price={<MediumLoadingBubble />}
      percentChange={<LoadingBubble />}
      tvl={<LoadingBubble />}
      volume={<LoadingBubble />}
      {...props}
    />
  )
}

interface LoadedRowProps {
  tokenListIndex: number
  tokenListLength: number
  token: NonNullable<LaunchpadToken>
  sparklineMap: SparklineMap
  sortRank: number
}

/* Loaded State: row component with token information */
export const LoadedRow = forwardRef((props: LoadedRowProps, ref: ForwardedRef<HTMLDivElement>) => {
  const { tokenListIndex, tokenListLength, token, sortRank } = props
  const filterString = useAtomValue(filterStringAtom)

  const lowercaseChainName = useParams<{ chainName?: string }>().chainName?.toUpperCase() ?? 'ethereum'
  const filterNetwork = lowercaseChainName.toUpperCase()
  const chainId = CHAIN_NAME_TO_CHAIN_ID[filterNetwork]
  const timePeriod = useAtomValue(filterTimeAtom)
  const delta = (parseFloat(token.txs![0].price ?? '0') - parseFloat(token.txs![1]?.price ?? '0')) * 100
  const arrow = getDeltaArrow(delta)
  const smallArrow = getDeltaArrow(delta, 14)
  const formattedDelta = formatDelta(delta)
  const [metaEntry, setMetaEntry] = useState<string | undefined>(undefined)
  const [metaJson, setMetaJson] = useState<any | undefined>(undefined)
  const [tokenState, setTokenState] = useState<any | undefined>(undefined)
  const metaManager = useMetaManagerContract()
  const [percentageRemaining, setPercentageRemaining] = useState(0)
  const physicaTokenFactory = usePhysicaTokenFactoryContract()

  physicaTokenFactory?.tokenStates(token.id).then((tokenState) => setTokenState(tokenState))

  useEffect(() => {
    if(tokenState) {
      const tokenHolding = parseFloat(BigInt(tokenState.tokenHolding).toString())
      const initialSupply = parseFloat(BigInt(tokenState.initialSupply).toString())
      const migrationCap = parseFloat(tokenState.migrationCap)
      setPercentageRemaining(migrationCap /
        (parseFloat('100') - (tokenHolding / initialSupply)))
    }

  }, [tokenState])



  if(!metaJson) {
    fetchMetaFromPinataIPFS(token.ipfsHash ?? '').then((meta) => setMetaJson(meta))
  }

  const exploreTokenSelectedEventProperties = {
    chain_id: chainId,
    token_address: token.id,
    token_symbol: token.symbol,
    token_list_index: tokenListIndex,
    token_list_rank: sortRank,
    token_list_length: tokenListLength,
    time_frame: timePeriod,
    search_token_address_input: filterString,
  }

  // TODO: currency logo sizing mobile (32px) vs. desktop (24px)
  // @ts-ignore
  return (
    <div ref={ref} data-testid={`token-table-row-${token.symbol}`}>
      <StyledLink
        to={getLaunchFactoryTokenDetailsURL(token)} // '/swap?inputCurrency=ETH&outputCurrency=' + token.id}}
        onClick={() =>
          sendAnalyticsEvent(InterfaceEventName.EXPLORE_TOKEN_ROW_CLICKED, exploreTokenSelectedEventProperties)
        }
      >
        <TokenRow
          header={false}
          listNumber={sortRank}
          tokenInfo={
            <ClickableName>
              <ImageContainer>
                <TokenLogoCircular src={'https://gateway.pinata.cloud/ipfs/' + metaJson?.image}></TokenLogoCircular>
              </ImageContainer>
              <TokenInfoCell>
                <TokenName data-cy="token-name">{token.name}</TokenName>
                <TokenSymbol>{token.symbol}</TokenSymbol>
              </TokenInfoCell>
            </ClickableName>
          }
          price={<ClickableContent>{timeSince(new Date((token.startTime ?? '0') * 1000))}</ClickableContent>}
          percentChange={
            <ClickableContent>{token.dev?.slice(token.dev?.length - 6, token.dev?.length)}</ClickableContent>
          }
          tvl={
            <ClickableContent>
              <BarWrapper>
                <Bar percent={percentageRemaining}>
                  <RowFixed>
                    <ThemedText.DeprecatedBody fontSize="12px" fontWeight={600} ml="8px" mt="-2px">
                      {percentageRemaining.toFixed(2)}%
                    </ThemedText.DeprecatedBody>
                  </RowFixed>
                </Bar>
              </BarWrapper>
            </ClickableContent>
          }
          volume={<ClickableContent>{token.txCount ?? '0'}</ClickableContent>}
          first={tokenListIndex === 0}
          last={tokenListIndex === tokenListLength - 1}
        />
      </StyledLink>
    </div>
  )
})

LoadedRow.displayName = 'LoadedRow'
