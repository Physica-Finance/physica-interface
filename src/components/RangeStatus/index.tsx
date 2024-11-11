import { Trans } from '@lingui/macro'
import { Position } from '@uniswap/v3-sdk'
import RangeBadge from 'components/Badge/RangeBadge'
import HoverInlineText from 'components/HoverInlineText'
import { getPriceOrderingFromPositionForUI } from 'components/PositionListItem'
import { RowFixed } from 'components/Row'
import { useToken } from 'hooks/Tokens'
import useIsTickAtLimit from 'hooks/useIsTickAtLimit'
import { usePool } from 'hooks/usePools'
import React, { useMemo } from 'react'
import { Bound } from 'state/mint/v3/actions'
import styled from 'styled-components/macro'
import { HideSmall, SmallOnly } from 'theme'
import { PositionDetails } from 'types/position'
import { formatTickPrice } from 'utils/formatTickPrice'
import { unwrappedToken } from 'utils/unwrappedToken'

const DataLineItem = styled.div`
  font-size: 14px;
`

const RangeLineItem = styled(DataLineItem)`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  user-select: none;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    
    border-radius: 12px; 
    padding: 8px 0;
`};
`

const DoubleArrow = styled.span`
  margin: 0 2px;
  color: ${({ theme }) => theme.textTertiary};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    margin: 4px;
    padding: 20px;
  `};
`

const RangeText = styled.span<{ small?: boolean }>`
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  user-select: none;
  font-size: ${({ small }) => (small ? '12px' : '14px')};
`

const ExtentsText = styled.span`
  color: ${({ theme }) => theme.textTertiary};
  font-size: 14px;
  margin-right: 4px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToLarge`
    display: none;
  `};
`

interface RangeStatusProps {
  positionDetails: PositionDetails
  small?: boolean // less text smaller font
}

export default function RangeStatus({ positionDetails, small }: RangeStatusProps) {
  const {
    token0: token0Address,
    token1: token1Address,
    fee: feeAmount,
    liquidity,
    tickLower,
    tickUpper,
  } = positionDetails

  const token0 = useToken(token0Address)
  const token1 = useToken(token1Address)

  const currency0 = token0 ? unwrappedToken(token0) : undefined
  const currency1 = token1 ? unwrappedToken(token1) : undefined

  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, feeAmount)

  const position = useMemo(() => {
    if (pool) {
      return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper })
    }
    return undefined
  }, [liquidity, pool, tickLower, tickUpper])

  // meta data about position
  const { priceLower, priceUpper, quote, base } = getPriceOrderingFromPositionForUI(position)
  const currencyQuote = quote && unwrappedToken(quote)
  const currencyBase = base && unwrappedToken(base)
  const tickAtLimit = useIsTickAtLimit(feeAmount, tickLower, tickUpper)
  const outOfRange: boolean = pool ? pool.tickCurrent < tickLower || pool.tickCurrent >= tickUpper : false
  const removed = liquidity?.eq(0)

  return (
    <RowFixed>
      <RangeLineItem>
        <RangeBadge removed={removed} inRange={!outOfRange} small={true} />
        <RangeText small={small}>
          <ExtentsText>
            <Trans>Min: </Trans>
          </ExtentsText>
          <Trans>
            {formatTickPrice({ price: priceLower, atLimit: tickAtLimit, direction: Bound.LOWER })}{' '}
            <HoverInlineText text={currencyQuote?.symbol} /> per <HoverInlineText text={currencyBase?.symbol ?? ''} />
          </Trans>
        </RangeText>{' '}
        <HideSmall>
          <DoubleArrow>⟷</DoubleArrow>{' '}
        </HideSmall>
        <SmallOnly>
          <DoubleArrow>⟷</DoubleArrow>{' '}
        </SmallOnly>
        <RangeText small={small}>
          <ExtentsText>
            <Trans>Max:</Trans>
          </ExtentsText>
          <Trans>
            {formatTickPrice({ price: priceUpper, atLimit: tickAtLimit, direction: Bound.UPPER })}{' '}
            <HoverInlineText text={currencyQuote?.symbol} /> per{' '}
            <HoverInlineText maxCharacters={10} text={currencyBase?.symbol} />
          </Trans>
        </RangeText>
      </RangeLineItem>
    </RowFixed>
  )
}
