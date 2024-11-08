import { TransactionResponse } from '@ethersproject/providers'
import { Currency, Percent, Token } from '@uniswap/sdk-core'
import { computePoolAddress, FeeAmount, Pool, toHex } from '@uniswap/v3-sdk'
import { useWeb3React } from '@web3-react/core'
import { ButtonPrimary } from 'components/Button'
import { BlueCard, DarkCard, DarkGrayCard, GrayCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import FeeSelector from 'components/FeeSelector'
import { V3_CORE_FACTORY_ADDRESSES } from 'constants/addresses'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { useV3Staker } from 'hooks/useContract'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ChangeEventHandler, useCallback, useMemo, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'

import { TransactionType } from '../../state/transactions/types'
import { queryParametersToSwapState, useDefaultsFromURLSearch } from '../../state/swap/hooks'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { ParsedQs } from 'qs'
import { SwapState } from '../../state/swap/reducer'
import { Field } from '../../state/swap/actions'
import { isAddress } from '../../utils'
import { TOKEN_SHORTHANDS } from '../../constants/tokens'
import { usePool, usePools } from '../../hooks/usePools'
import { parseFeeAmount } from '@uniswap/smart-order-router'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import Badge from '../../components/Badge'
import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { RowFixed, RowFlat } from '../../components/Row'
import { useCurrency } from '../../hooks/Tokens'
import { Text } from 'rebass'
import { FixedHeightRow, StyledPositionCard } from '../../components/PositionCard'
import { CardNoise } from '../../components/earn/styled'

function dateTimeToUnixSeconds(dateTimeString: string, timezoneOffset: number): number {
  return Math.floor((new Date(dateTimeString).getTime() + timezoneOffset) / 1000)
}

const DataText = styled.div`
  font-weight: 600;
  font-size: 18px;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 18px;
  `};
`

const BadgeText = styled.div`
  font-weight: 500;
  font-size: 14px;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 12px;
  `};
`


function parseCurrencyFromURLParameter(urlParam: ParsedQs[string]): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    const upper = urlParam.toUpperCase()
    if (upper === 'ETH') return 'ETH'
    if (upper in TOKEN_SHORTHANDS) return upper
  }
  return ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function queryParametersToPoolState(parsedQs: ParsedQs) {
  let poolId = parseCurrencyFromURLParameter(parsedQs.pool)
  let token0 = parseCurrencyFromURLParameter(parsedQs.token0)
  let token1 = parseCurrencyFromURLParameter(parsedQs.token1)
  let fees = parseTokenAmountURLParameter(parsedQs.fees)

  if (poolId === '') {
    // Defaults to having the native currency selected
    poolId = '0xaad2f7f4c623a0543d827618d8188af24c586541'
  }

  return {
    poolId, token0, token1, fees
  }
}

export default function CreateIncentive() {
  const parsedQs = useParsedQueryString()
  const parsedPoolState = useMemo(() => {
    return queryParametersToPoolState(parsedQs)
  }, [parsedQs])
  let poolId = parsedPoolState.poolId

  const { account, chainId } = useWeb3React()

  const staker = useV3Staker()
  const currencyA = useCurrency(parsedPoolState.token0)
  const currencyB = useCurrency(parsedPoolState.token1)
  const [,pool] = usePools([[currencyA!, currencyB!, parseFeeAmount(parsedPoolState.fees)]])[0]


  const [refundee, setRefundee] = useState<string | undefined>(account ?? '')

  const [currencyC, setCurrencyC] = useState<Currency | undefined>(undefined)
  const [rewardTyped, setRewardTyped] = useState<string>('')
  const rewardAmount = tryParseCurrencyAmount(rewardTyped, currencyC)

  const [approval, approveCallback] = useApproveCallback(rewardAmount, staker?.address)

  const [feeAmount, setFeeAmount] = useState<FeeAmount | undefined>(parseFeeAmount(parsedPoolState.fees))

  const v3CoreFactoryAddress = chainId && V3_CORE_FACTORY_ADDRESSES[chainId]

  const addTransaction = useTransactionAdder()

  const poolAddress = parsedPoolState.poolId
  let currentDate = new Date(Date.now())
  let timezoneOffset = currentDate.getTimezoneOffset() * -60000
  let startDate = new Date(Date.now()+1000*60*10 + timezoneOffset)

  const [startTime, setStartTime] = useState<string>(startDate.toISOString().slice(0, -8))
  let endDate = new Date(Date.now()+1000*60*60*24*30+1000*60*10+timezoneOffset)

  const [endTime, setEndTime] = useState<string>(endDate.toISOString().slice(0, -8))

  const handleCreate = async () => {
    if (
      staker &&
      currencyA &&
      currencyB &&
      rewardAmount &&
      currencyC &&
      startTime &&
      endTime &&
      refundee &&
      poolAddress
    ) {
      staker
        .createIncentive(
          {
            rewardToken: currencyC.wrapped.address,
            pool: poolAddress,
            startTime: dateTimeToUnixSeconds(startTime,0),
            endTime: dateTimeToUnixSeconds(endTime,0),
            refundee,
          },
          toHex(rewardAmount.quotient)
        )
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            type: TransactionType.DEPOSIT_LIQUIDITY_STAKING,
            token0Address: currencyA.wrapped.address,
            token1Address: currencyB.wrapped.address,
          })
        })
        .catch((error: any) => {
          console.log(error)
        })
    } else {
      console.log(staker, currencyA, currencyB, rewardAmount, currencyC, startTime, endTime, refundee, poolAddress)
    }
  }

  const handleChangeStartTime: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setStartTime(e.target.value)
  }, [])
  const handleChangeEndTime: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    setEndTime(e.target.value)
  }, [])

  return (
    <AutoColumn gap="lg" justify="center">
    <StyledPositionCard border={"#FFFFFF"} bgColor={"#FFFFFF"}>
      <CardNoise />
    <AutoColumn gap="30px">
      <FixedHeightRow>
        <RowFixed>
          <DataText>
            <div>Incentivize Pool</div>
          </DataText>
        </RowFixed>
      </FixedHeightRow>

      <RowFlat>
        <DoubleCurrencyLogo
          currency0={pool?.token0}
          currency1={pool?.token1}
          size={18}
          margin
        />
        <DataText>
          &nbsp;{pool?.token0?.symbol}&nbsp;/&nbsp;{pool?.token1?.symbol}
        </DataText>
        &nbsp;
        <Badge>
          <BadgeText>
            <Trans>
              {new Percent(
                pool?.fee ?? FeeAmount.LOWEST,
                1_000_000
              ).toSignificant()}
              %
            </Trans>
          </BadgeText>
        </Badge>
      </RowFlat>
      <AutoColumn gap="4px">
        <div>Reward Token</div>
        <CurrencyInputPanel
          value={rewardTyped}
          currency={currencyC ?? null}
          onUserInput={(val) => {
            setRewardTyped(val);
          }}
          hideInput={false}
          showMaxButton={false}
          onCurrencySelect={(currency) => {
            setCurrencyC(currency);
          }}
          id="token-select-b"
        />
      </AutoColumn>
      <DarkGrayCard>
        <AutoColumn gap="4px">
          <div>Start time</div>
          <input
            type="datetime-local"
            value={startTime}
            onChange={handleChangeStartTime}
            style={{ width: "400px" }}
          />
        </AutoColumn>
      </DarkGrayCard>
      <DarkGrayCard>
        <AutoColumn gap="4px">
          <div>End time</div>
          <input
            type="datetime-local"
            value={endTime}
            onChange={handleChangeEndTime}
            style={{ width: "400px" }}
          />
        </AutoColumn>
      </DarkGrayCard>
      <AutoColumn gap="4px">
        <div>Refund Address</div>
        <input disabled={true} type={"text"} value={account} onChange={(e) => setRefundee(e.target.value)} />
      </AutoColumn>
      {approval === ApprovalState.APPROVED ? null : (
        <ButtonPrimary onClick={approveCallback}>Approve</ButtonPrimary>
      )}
      <ButtonPrimary
        disabled={approval !== ApprovalState.APPROVED}
        onClick={handleCreate}
      >
        Create
      </ButtonPrimary>
    </AutoColumn>
    </StyledPositionCard>
    </AutoColumn>
  );
}
