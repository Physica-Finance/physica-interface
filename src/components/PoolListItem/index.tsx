import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import { Percent, Price, Token } from '@uniswap/sdk-core'
import { parseFeeAmount } from '@uniswap/smart-order-router'
import { FeeAmount, Position } from '@uniswap/v3-sdk'
import Badge from 'components/Badge'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { useToken } from 'hooks/Tokens'
import { usePool } from 'hooks/usePools'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'
import { unwrappedToken } from 'utils/unwrappedToken'
import { hasURL } from 'utils/urlChecks'

import { DAI, USDC_MAINNET, USDT, WBTC, WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'
import {
  LARGE_MEDIA_BREAKPOINT,
  MAX_WIDTH_MEDIA_BREAKPOINT,
  MEDIUM_MEDIA_BREAKPOINT,
  SMALL_MEDIA_BREAKPOINT,
} from '../Tokens/constants'
import { FixedHeightRow } from '../PositionCard'

const Cell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
const StyledLink = styled(Link)`
  text-decoration: none;
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

const NameCell = styled(Cell)`
  justify-content: flex-start;
  padding: 0px 8px;
  min-width: 240px;
  gap: 8px;
`

const TvlCell = styled(DataCell)`
  padding-right: 8px;
  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const VolumeCell = styled(DataCell)`
  padding-right: 8px;
  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    display: none;
  }
`
const LinkRow = styled(Link)`
  align-items: center;
  display: flex;
  cursor: pointer;
  user-select: none;
  display: flex;
  z-index: 1;
  flex-direction: column;
  justify-content: space-between;
  color: ${({ theme }) => theme.textPrimary};
  padding: 16px;
  text-decoration: none;
  font-weight: 500;

  & > div:not(:first-child) {
    text-align: center;
  }
  :hover {
    background-color: ${({ theme }) => theme.hoverDefault};
  }

  @media screen and (min-width: ${MEDIA_WIDTHS.deprecated_upToSmall}px) {
    /* flex-direction: row; */
  }

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex-direction: column;
    row-gap: 8px;
  `};
`

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 14px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 12px;
  `};
`

const DataLineItem = styled.div`
  font-size: 14px;
`
const StyledTokenRow = styled.div<{
  first?: boolean
  last?: boolean
  loading?: boolean
}>`
  background-color: transparent;
  display: grid;
  font-size: 16px;
  grid-template-columns: 1fr 4fr 4fr;
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

  @media only screen and (max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 4fr 4fr;
  }

  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 4fr 4fr;
  }

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 4fr 4fr;
  }

  @media only screen and (max-width: ${SMALL_MEDIA_BREAKPOINT}) {
    grid-template-columns: 1fr 4fr 4fr;
    min-width: unset;
    border-bottom: 0.5px solid ${({ theme }) => theme.backgroundModule};

    :last-of-type {
      border-bottom: none;
    }
  }
`
const RangeLineItem = styled(DataLineItem)`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 4px;
  width: 100%;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
  background-color: ${({ theme }) => theme.deprecated_bg3};
    border-radius: 12px;
    padding: 8px 0;
`};
`

const DoubleArrow = styled.span`
  margin: 0 2px;
  color: ${({ theme }) => theme.textTertiary};
`

const RangeText = styled.span`
  padding: 0.25rem 0.25rem;
  border-radius: 8px;
`

const ExtentsText = styled.span`
  color: ${({ theme }) => theme.textTertiary};
  font-size: 14px;
  margin-right: 4px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    display: none;
  `};
`

const PrimaryPositionIdData = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  > * {
    margin-right: 8px;
  }
`

const DataText = styled.div`
  font-weight: 600;
  font-size: 18px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 18px;
  `};
`

interface PositionListItemProps {
  token0: string
  token1: string
  tokenId: BigNumber
  fee: number
  liquidity: BigNumber
  tickLower: number
  tickUpper: number
}

export function getPriceOrderingFromPositionForUI(position?: Position): {
  priceLower?: Price<Token, Token>
  priceUpper?: Price<Token, Token>
  quote?: Token
  base?: Token
} {
  if (!position) {
    return {}
  }

  const token0 = position.amount0.currency
  const token1 = position.amount1.currency

  // if token0 is a dollar-stable asset, set it as the quote token
  const stables = [DAI, USDC_MAINNET, USDT]
  if (stables.some((stable) => stable.equals(token0))) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    }
  }

  // if token1 is an ETH-/BTC-stable asset, set it as the base token
  const bases = [...Object.values(WRAPPED_NATIVE_CURRENCY), WBTC]
  if (bases.some((base) => base && base.equals(token1))) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    }
  }

  // if both prices are below 1, invert
  if (position.token0PriceUpper.lessThan(1)) {
    return {
      priceLower: position.token0PriceUpper.invert(),
      priceUpper: position.token0PriceLower.invert(),
      quote: token0,
      base: token1,
    }
  }

  // otherwise, just return the default
  return {
    priceLower: position.token0PriceLower,
    priceUpper: position.token0PriceUpper,
    quote: token1,
    base: token0,
  }
}

export default function PoolListItem(poolGraphql: any) {
  const token0 = useToken(poolGraphql?.token0.id)
  const token1 = useToken(poolGraphql?.token1.id)

  const currency0 = token0 ? unwrappedToken(token0) : undefined
  const currency1 = token1 ? unwrappedToken(token1) : undefined

  // construct Position from details returned
  const [poolState, pool] = usePool(
    currency0 ?? undefined,
    currency1 ?? undefined,
    parseFeeAmount(poolGraphql?.feeTier)
  )

  const positionSummaryLink =
    '/program?pool=' +
    poolGraphql?.id +
    '&token0=' +
    poolGraphql?.token0.id +
    '&token1=' +
    poolGraphql?.token1.id +
    '&fees=' +
    poolGraphql?.feeTier

  const containsURL = useMemo(
    () =>
      [token0?.name, token0?.symbol, token1?.name, token1?.symbol].reduce(
        (acc, testString) => acc || Boolean(testString && hasURL(testString)),
        false
      ),
    [token0?.name, token0?.symbol, token1?.name, token1?.symbol]
  )

  if (containsURL) {
    return null
  }

  return (
    <LinkRow to={positionSummaryLink}>
      <FixedHeightRow>
        <NameCell data-testid="tvsl-cell">
          <DoubleCurrencyLogo currency0={pool?.token0} currency1={pool?.token1} size={18} />
          <DataText>
            &nbsp;{pool?.token0?.symbol}&nbsp;/&nbsp;{pool?.token1?.symbol}
          </DataText>
          &nbsp;
          <Badge>
            <BadgeText>
              <Trans>{new Percent(pool?.fee ?? FeeAmount.LOWEST, 1_000_000).toSignificant()}%</Trans>
            </BadgeText>
          </Badge>
        </NameCell>

        <VolumeCell data-testid="tfvl-cell" sortable={false}>
          ${parseFloat(poolGraphql?.volumeUSD).toFixed(2)}
        </VolumeCell>
        <TvlCell data-testid="tvl-cell" sortable={false}>
          ${parseFloat(poolGraphql?.totalValueLockedUSD).toFixed(2)}
        </TvlCell>
      </FixedHeightRow>
    </LinkRow>
  )
}
