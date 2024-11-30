import { Trans } from '@lingui/macro'
import { formatCurrencyAmount, NumberType } from '@uniswap/conedison/format'
import { Currency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { CHAIN_ID_TO_BACKEND_NAME } from 'graphql/data/util'
import { useStablecoinValue } from 'hooks/useStablecoinPrice'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import styled from 'styled-components/macro'
import { StyledInternalLink } from 'theme'
import { AutoRow } from '../../Row'
import React, { Dispatch, SetStateAction } from 'react'
import { ButtonPrimary } from '../../Button'

const Wrapper = styled.div`
  align-content: center;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background-color: ${({ theme }) => theme.backgroundSurface};
  border-radius: 20px 20px 0px 0px;
  bottom: 56px;
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  flex-direction: column;
  font-weight: 500;
  font-size: 14px;
  height: fit-content;
  justify-content: space-between;
  left: 0;
  line-height: 20px;
  padding: 12px 16px;
  position: fixed;
  width: 100%;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    bottom: 0px;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.lg}px) {
    display: none;
  }
`
const BalanceValue = styled.div`
  color: ${({ theme }) => theme.textPrimary};
  font-size: 20px;
  line-height: 28px;
  display: flex;
  gap: 8px;
`
const Balance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`
const BalanceInfo = styled.div`
  display: flex;
  flex: 10 1 auto;
  flex-direction: column;
  justify-content: stretch;
  padding: 12px 0px;
`
const FiatValue = styled.span`
  font-size: 12px;
  line-height: 16px;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.sm}px) {
    line-height: 24px;
  }
`
const SwapButton = styled(StyledInternalLink)`
  background-color: ${({ theme }) => theme.accentAction};
  border: none;
  border-radius: 12px;
  color: ${({ theme }) => theme.accentTextLightPrimary};
  display: flex;
  flex: 1 1 auto;
  padding: 12px 16px;
  font-size: 1em;
  font-weight: 600;
  height: 44px;
  justify-content: center;
  margin: auto;
  max-width: 100vw;
`
const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  border-radius: 12px;

  padding: 12px 16px;
  margin: 8px 0px;
  flex: 1 1 auto;
  width: 100%;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 100%;
  `};
`
export default function MobileBalanceSummaryFooter({
  token,
  buyModal,
  sellModal,
}: {
  token: Currency
  buyModal: Dispatch<SetStateAction<boolean>>
  sellModal: Dispatch<SetStateAction<boolean>>
}) {
  const { account } = useWeb3React()
  const balance = useCurrencyBalance(account, token)
  const formattedBalance = formatCurrencyAmount(balance, NumberType.TokenNonTx)
  const formattedUsdValue = formatCurrencyAmount(useStablecoinValue(balance), NumberType.FiatTokenStats)
  const chain = CHAIN_ID_TO_BACKEND_NAME[7070].toLowerCase()

  return (
    <Wrapper>
      {Boolean(account && balance) && (
        <BalanceInfo>
          <Trans>Your {token.symbol} balance</Trans>
          <Balance>
            <BalanceValue>
              {formattedBalance} {token.symbol}
            </BalanceValue>
            <FiatValue>{formattedUsdValue}</FiatValue>
          </Balance>
        </BalanceInfo>
      )}
      <AutoRow justify={'space-between'}>
        <ResponsiveButtonPrimary disabled={!account} onClick={() => buyModal(true)}>
          <Trans>Buy</Trans>
        </ResponsiveButtonPrimary>
      </AutoRow>
      <AutoRow justify={'stretch'}>
        <ResponsiveButtonPrimary disabled={!account} onClick={() => sellModal(true)}>
          <Trans>Sell</Trans>
        </ResponsiveButtonPrimary>
      </AutoRow>
    </Wrapper>
  )
}
