import LaunchFactoryTokenDetails from 'components/LaunchFactory/TokenDetails'
import { TokenDetailsPageSkeleton } from 'components/LaunchFactory/TokenDetails/Skeleton'
import { TimePeriod, toHistoryDuration, validateUrlChainParam } from 'graphql/data/util'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getNativeTokenDBAddress } from 'utils/nativeTokens'
import { TOKEN_PRICE_QUERY } from '../../graphql/physica/TokenPrice'
import { useQuery } from '@apollo/client'
import { apolloClient } from '../../graphql/physicalaunchfactory/apollo'
import {
  LAUNCHPAD_TOKEN_PRICE_QUERY,
  LAUNCHPAD_TOKEN_QUERY, LaunchpadTokenQuery
} from '../../graphql/physicalaunchfactory/LaunchFactoryToken'
import { isAddress } from '../../utils'

export const pageTimePeriodAtom = atomWithStorage<TimePeriod>('tokenDetailsTimePeriod', TimePeriod.MONTH)

export default function LaunchFactoryTokenDetailsPage() {
  const { tokenAddress, chainName, referral } = useParams<{
    tokenAddress: string
    chainName?: string
    referral?: string
  }>()
  const chain = validateUrlChainParam(chainName)
  const isNative = true
  const referralAddress = isAddress(referral) ? referral : undefined
  const [timePeriod, setTimePeriod] = useAtom(pageTimePeriodAtom)

  const [address, duration] = useMemo(
    /* tokenAddress will always be defined in the path for for this page to render, but useParams will always
      return optional arguments; nullish coalescing operator is present here to appease typechecker */
    () => [isNative ? getNativeTokenDBAddress(chain) : tokenAddress ?? '', toHistoryDuration(timePeriod)],
    [chain, isNative, timePeriod, tokenAddress]
  )

  const { data: tokenQuery } = useQuery(LAUNCHPAD_TOKEN_QUERY, {
    variables: {
      id: tokenAddress,
    },
    client: apolloClient,
  })

  const { data: tokenPriceQuery } = useQuery(LAUNCHPAD_TOKEN_PRICE_QUERY, {
    variables: {
      id: tokenAddress,
      duration: Math.floor(Date.now() / 1000 - 86400 * 30),
    },
    client: apolloClient,
  })

  // Saves already-loaded chart data into state to display while tokenPriceQuery is undefined timePeriod input changes
  const [currentPriceQuery, setCurrentPriceQuery] = useState(tokenPriceQuery)
  useEffect(() => {
    if (tokenPriceQuery) {
      const newPrice: LaunchpadTokenQuery = {
        token: {
          id: tokenPriceQuery.token.id,
          name: tokenPriceQuery.token.name,
          symbol: tokenPriceQuery.token.symbol,
          dev: tokenPriceQuery.token.dev,
          ipfsHash: tokenPriceQuery.token.ipfsHash,
          initialSupply: tokenPriceQuery.token.initialSupply,
          migrationCap: tokenPriceQuery.token.migrationCap,
          plqAmount: tokenPriceQuery.token.plqAmount,
          startTime: tokenPriceQuery.token.startTime,
          tokenAmount: tokenPriceQuery.token.tokenAmount,
          migrated: tokenPriceQuery.token.migrated,
          txCount: tokenPriceQuery.token,
          buys: [],
          sells: [],
        },
      }

      if (tokenPriceQuery.token.buys) {

        for(let i = 0;i < tokenPriceQuery.token.buys.length; i++) {
          newPrice!.token!.buys![i] = {
            price: (tokenPriceQuery.token.buys[i].plqAmount / tokenPriceQuery.token.buys[i].tokenAmount).toString(),
            plqAmount: tokenPriceQuery.token.buys[i].plqAmount,
            tokenAmount: tokenPriceQuery.token.buys[i].tokenAmount,
            timestamp: tokenPriceQuery.token.buys[i].timestamp,
            buyer: tokenPriceQuery.token.buys[i].buyer,
            id: tokenPriceQuery.token.buys[i].id,
          }
        }
      }
      if (tokenPriceQuery.token.sells) {
        for (let i = 0; i < tokenPriceQuery.token.sells.length; i++) {
          newPrice!.token!.sells![i] = {
            price: (tokenPriceQuery.token.sells[i].plqAmount / tokenPriceQuery.token.sells[i].tokenAmount).toString(),
            plqAmount: tokenPriceQuery.token.sells[i].plqAmount,
            tokenAmount: tokenPriceQuery.token.sells[i].tokenAmount,
            timestamp: tokenPriceQuery.token.sells[i].timestamp,
            seller: tokenPriceQuery.token.sells[i].seller,
            id: tokenPriceQuery.token.sells[i].id,
          }
        }
      }
      setCurrentPriceQuery(newPrice)
    }
  }, [setCurrentPriceQuery, tokenPriceQuery])

  if (!tokenQuery) return <TokenDetailsPageSkeleton />

  return (
    <LaunchFactoryTokenDetails
      urlAddress={tokenAddress}
      chain={chain}
      referralAddress={referralAddress}
      tokenQuery={tokenQuery}
      tokenPriceQuery={currentPriceQuery}
      onChangeTimePeriod={setTimePeriod}
    />
  )
}
