import { Trans } from '@lingui/macro'
import { GenericBadge } from 'components/Badge'
import Loader from 'components/Loader'
import React from 'react'
import { Zap } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { DarkCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import ProgramCard from '../../components/earn/ProgramCard'
import { CardBGImage, CardSection, DataCard, OverviewGrid } from '../../components/earn/styled'
import PoolListItem from '../../components/PoolListItem'
import { RowBetween, RowFixed } from '../../components/Row'
import useTrendingPools2 from '../../graphql/physica/TrendingPools'
import { useAllIncentivesByPool } from '../../hooks/incentives/useAllIncentives'
import { LARGE_MEDIA_BREAKPOINT, MAX_WIDTH_MEDIA_BREAKPOINT } from '../../components/Tokens/constants'
import { TitleRow } from '../../nft/components/profile/list/shared'

const PageWrapper = styled(AutoColumn)`
  padding: 68px 8px 0px;
  max-width: 870px;
  width: 100%;

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    max-width: 800px;
  `};

  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    max-width: 500px;
  `};

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 48px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`

const TopSection = styled(AutoColumn)`
  width: 100%;
`

const TokenDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  width: 100%;
`

const MobileHeader = styled(ThemedText.HeadlineSmall)`
  @media only screen and (max-width: ${LARGE_MEDIA_BREAKPOINT}) {
    display: none;
  }
`

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  background-color: ${({ theme }) => theme.backgroundSurface};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  margin-left: auto;
  margin-right: auto;
  border-radius: 12px;
  padding: 12px;
  justify-content: center;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
`

const ProgramSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 12px;
  width: 100%;
  justify-self: center;
`

const MainContentWrapper = styled.main`
  background-color: ${({ theme }) => theme.backgroundSurface};
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  padding: 0;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
`

export default function Stake() {
  const theme = useTheme()

  const { loading, incentives } = useAllIncentivesByPool()

  const { data: allPools, loading: poolsLoading } = useTrendingPools2()

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <RowBetween>
          <ThemedText.DeprecatedBody style={{ marginTop: '0.5rem' }} fontSize="20px" color={theme.textTertiary}>
            <Trans>Boosted Pools</Trans>
          </ThemedText.DeprecatedBody>
        </RowBetween>
        <DataCard>
          <CardSection>
            <AutoColumn gap="md">
              <GenericBadge style={{ backgroundColor: theme.deprecated_blue4 }}>
                <RowFixed>
                  <Zap stroke={theme.deprecated_blue4} size="16px" strokeWidth="3px" />
                  <ThemedText.DeprecatedBody fontWeight={700} fontSize="12px" color={theme.deprecated_blue4} ml="4px">
                    Liquidity Mining
                  </ThemedText.DeprecatedBody>
                </RowFixed>
              </GenericBadge>
              <ThemedText.DeprecatedBody fontWeight={600} fontSize="24px" color={theme.deprecated_blue4}>
                <Trans>Earn more with boosts</Trans>
              </ThemedText.DeprecatedBody>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
        </DataCard>
      </TopSection>
      <DarkCard padding="12px">
        <AutoColumn gap="md">
          <TitleRow style={{ padding: '0' }}>
            <ThemedText.HeadlineSmall justifySelf="flex-start">
              <Trans>Active Programs</Trans>
            </ThemedText.HeadlineSmall>
          </TitleRow>
          <ProgramSection>
            {loading || poolsLoading ? (
              <Loader />
            ) : !incentives ? (
              <ThemedText.DeprecatedBody>
                <Trans>Error loading program</Trans>{' '}
              </ThemedText.DeprecatedBody>
            ) : (
              Object.keys(incentives).map((poolAddress) => (
                <ProgramCard
                  key={poolAddress + '-program-overview'}
                  poolAddress={poolAddress}
                  incentives={incentives[poolAddress]}
                />
              ))
            )}
          </ProgramSection>
        </AutoColumn>
      </DarkCard>
      <DarkCard>
        <AutoColumn gap="lg">
          <TitleRow style={{ padding: '0' }}>
            <ThemedText.HeadlineSmall justifySelf="flex-start">
              <Trans>Pools</Trans>
            </ThemedText.HeadlineSmall>
            <MobileHeader style={{ whiteSpace: 'nowrap' }}>
              <Trans>Total Volume</Trans>
            </MobileHeader>
            <MobileHeader>
              <Trans>TVL USD</Trans>
            </MobileHeader>
          </TitleRow>
          <ProgramSection>
            {poolsLoading || !allPools ? (
              <Loader />
            ) : (
              allPools.map((pool: any) => <PoolListItem key={pool.id.toString()} {...pool} />)
            )}
          </ProgramSection>
        </AutoColumn>
      </DarkCard>
    </PageWrapper>
  )
}
