import { ParentSize } from '@visx/responsive'
import { ChartContainer, LoadingChart } from 'components/LaunchFactory/TokenDetails/Skeleton'
import { TokenPriceQuery2 } from 'graphql/physica/TokenPrice'
import { isPricePoint, PricePoint, TimePeriod } from 'graphql/data/util'
import { useAtomValue } from 'jotai/utils'
import { pageTimePeriodAtom } from 'pages/TokenDetails'
import { startTransition, Suspense, useMemo } from 'react'

import { PriceChart } from './PriceChart'
import TimePeriodSelector from './TimeSelector'

function usePriceHistory(tokenPriceData: TokenPriceQuery2): PricePoint[] | undefined {
  // Appends the current price to the end of the priceHistory array
  return useMemo(() => {
    const market = tokenPriceData.token?.tokenDayData
    const priceHistory = market?.filter(isPricePoint)
    const currentPrice = priceHistory?.[priceHistory.length -1]?.priceUSD
    if (Array.isArray(priceHistory) && currentPrice !== undefined) {
      const timestamp = Date.now() / 1000
      return [...priceHistory, { date: timestamp, priceUSD: currentPrice }]
    }
    return priceHistory
  }, [tokenPriceData])
}
export default function ChartSection({
  tokenPriceQuery,
  onChangeTimePeriod,
}: {
  tokenPriceQuery?: TokenPriceQuery2
  onChangeTimePeriod: OnChangeTimePeriod
}) {
  if (!tokenPriceQuery) {
    return <LoadingChart />
  }

  return (
    <Suspense fallback={<LoadingChart />}>
      <ChartContainer>
        <Chart tokenPriceQuery={tokenPriceQuery} onChangeTimePeriod={onChangeTimePeriod} />
      </ChartContainer>
    </Suspense>
  )
}

export type OnChangeTimePeriod = (t: TimePeriod) => void
function Chart({
  tokenPriceQuery,
  onChangeTimePeriod,
}: {
  tokenPriceQuery: TokenPriceQuery2
  onChangeTimePeriod: OnChangeTimePeriod
}) {
  const prices = usePriceHistory(tokenPriceQuery)
  // Initializes time period to global & maintain separate time period for subsequent changes
  const timePeriod = useAtomValue(pageTimePeriodAtom)

  return (
    <ChartContainer data-testid="chart-container">
      <ParentSize>
        {({ width }) => <PriceChart prices={prices ?? null} width={width} height={436} timePeriod={timePeriod} />}
      </ParentSize>
      {/*<TimePeriodSelector
        currentTimePeriod={timePeriod}
        onTimeChange={(t: TimePeriod) => {
          startTransition(() => onChangeTimePeriod(t))
        }}
      />*/}
    </ChartContainer>
  )
}
