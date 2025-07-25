import { Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { GenericBadge } from 'components/Badge'
import Loader from 'components/Loader'
import React, { useState } from 'react'
import { Zap } from 'react-feather'
import styled, { useTheme } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { DarkCard } from '../../components/Card'
import { AutoColumn } from '../../components/Column'
import ProgramCard from '../../components/earn/ProgramCard'
import ExpiredProgramCard from '../../components/earn/ExpiredProgramCard'
import UserProgramCard from '../../components/earn/UserProgramCard'
import { CardBGImage, CardSection, DataCard } from '../../components/earn/styled'
import PoolListItem from '../../components/PoolListItem'
import { RowBetween, RowFixed } from '../../components/Row'
import useTrendingPools2 from '../../graphql/physica/TrendingPools'
import { Incentive, useAllIncentivesByPool } from '../../hooks/incentives/useAllIncentives'
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

const TabContainer = styled.div`
  display: flex;
  gap: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.backgroundOutline};
  padding: 0 24px;
  overflow-x: auto;
  
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    gap: 16px;
    padding: 0 16px;
  `};
`

const Tab = styled.button<{ active: boolean }>`
  padding: 16px 0;
  font-size: 16px;
  font-weight: 500;
  background: none;
  border: none;
  border-bottom: 2px solid ${({ active, theme }) => (active ? theme.accentAction : 'transparent')};
  color: ${({ active, theme }) => (active ? theme.textPrimary : theme.textSecondary)};
  cursor: pointer;
  transition: color 0.2s;
  white-space: nowrap;
  
  &:hover {
    color: ${({ theme }) => theme.textPrimary};
  }
  
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    font-size: 14px;
    padding: 12px 0;
  `};
`

const TabContent = styled.div`
  padding: 24px;
  
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    padding: 16px;
  `};
`

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
`

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.backgroundOutline};
  background: ${({ active, theme }) => (active ? theme.accentAction : theme.backgroundSurface)};
  color: ${({ active, theme }) => (active ? theme.white : theme.textPrimary)};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ active, theme }) => (active ? theme.accentAction : theme.backgroundModule)};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const PageInfo = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  margin: 0 8px;
`

enum StakeTab {
  ACTIVE = 'active',
  MY_EXPIRED = 'my_expired',
  EXPIRED = 'expired',
  POOLS = 'pools'
}

const ITEMS_PER_PAGE = 10

export default function Stake() {
  const theme = useTheme()
  const { account } = useWeb3React()
  const [activeTab, setActiveTab] = useState<StakeTab>(StakeTab.ACTIVE)
  const [expiredPage, setExpiredPage] = useState(1)
  const [poolsPage, setPoolsPage] = useState(1)

  const { loading, incentives } = useAllIncentivesByPool()
  const { data: allPools, loading: poolsLoading } = useTrendingPools2()
  
  // Filter out expired incentives - only compute for active tab
  const activeIncentives = React.useMemo(() => {
    if (!incentives || activeTab !== StakeTab.ACTIVE) return undefined
    
    const currentTime = Date.now() / 1000
    const filtered: { [poolAddress: string]: Incentive[] } = {}
    
    Object.entries(incentives).forEach(([poolAddress, poolIncentives]) => {
      const activePoolIncentives = poolIncentives.filter(incentive => incentive.endTime > currentTime)
      if (activePoolIncentives.length > 0) {
        filtered[poolAddress] = activePoolIncentives
      }
    })
    
    return filtered
  }, [incentives, activeTab])
  
  // Get all incentives where user is the refundee - only compute when needed
  const userCreatedIncentives = React.useMemo(() => {
    if (!incentives || !account || (activeTab !== StakeTab.MY_EXPIRED && activeTab !== StakeTab.ACTIVE)) return undefined
    
    const filtered: { [poolAddress: string]: Incentive[] } = {}
    
    Object.entries(incentives).forEach(([poolAddress, poolIncentives]) => {
      const userPoolIncentives = poolIncentives.filter(
        incentive => incentive.refundee.toLowerCase() === account.toLowerCase()
      )
      if (userPoolIncentives.length > 0) {
        filtered[poolAddress] = userPoolIncentives
      }
    })
    
    return filtered
  }, [incentives, account, activeTab])
  
  // Get all expired incentives - only compute when on expired tab
  const allExpiredIncentives = React.useMemo(() => {
    if (!incentives || activeTab !== StakeTab.EXPIRED) return undefined
    
    const currentTime = Date.now() / 1000
    const filtered: { [poolAddress: string]: Incentive[] } = {}
    
    Object.entries(incentives).forEach(([poolAddress, poolIncentives]) => {
      const expiredPoolIncentives = poolIncentives.filter(
        incentive => incentive.endTime < currentTime
      )
      if (expiredPoolIncentives.length > 0) {
        filtered[poolAddress] = expiredPoolIncentives
      }
    })
    
    return filtered
  }, [incentives, activeTab])
  
  // Count tabs for badges - compute once for all tabs
  const [counts, setCounts] = React.useState({ active: 0, myCreated: 0, expired: 0, pools: 0 })
  
  React.useEffect(() => {
    if (!incentives) return
    
    const currentTime = Date.now() / 1000
    let activeCount = 0
    let myCreatedCount = 0  
    let expiredCount = 0
    
    Object.entries(incentives).forEach(([, poolIncentives]) => {
      poolIncentives.forEach(incentive => {
        if (incentive.endTime > currentTime) {
          activeCount++
        } else {
          expiredCount++
        }
        if (account && incentive.refundee.toLowerCase() === account.toLowerCase()) {
          myCreatedCount++
        }
      })
    })
    
    setCounts({
      active: activeCount,
      myCreated: myCreatedCount,
      expired: expiredCount,
      pools: allPools?.length || 0
    })
  }, [incentives, account, allPools])
  
  // Paginate expired incentives
  const paginatedExpiredIncentives = React.useMemo(() => {
    if (!allExpiredIncentives) return { data: {}, totalPages: 0, totalItems: 0 }
    
    const allItems: { poolAddress: string; incentive: Incentive }[] = []
    Object.entries(allExpiredIncentives).forEach(([poolAddress, incentives]) => {
      incentives.forEach(incentive => {
        allItems.push({ poolAddress, incentive })
      })
    })
    
    const startIndex = (expiredPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedItems = allItems.slice(startIndex, endIndex)
    
    // Group back by pool address
    const grouped: { [poolAddress: string]: Incentive[] } = {}
    paginatedItems.forEach(({ poolAddress, incentive }) => {
      if (!grouped[poolAddress]) grouped[poolAddress] = []
      grouped[poolAddress].push(incentive)
    })
    
    return {
      data: grouped,
      totalPages: Math.ceil(allItems.length / ITEMS_PER_PAGE),
      totalItems: allItems.length
    }
  }, [allExpiredIncentives, expiredPage])
  
  // Paginate pools
  const paginatedPools = React.useMemo(() => {
    if (!allPools) return { data: [], totalPages: 0 }
    
    const startIndex = (poolsPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    
    return {
      data: allPools.slice(startIndex, endIndex),
      totalPages: Math.ceil(allPools.length / ITEMS_PER_PAGE)
    }
  }, [allPools, poolsPage])
  
  // Reset page when changing tabs
  React.useEffect(() => {
    setExpiredPage(1)
    setPoolsPage(1)
  }, [activeTab])

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
      
      <MainContentWrapper>
        <TabContainer>
          <Tab active={activeTab === StakeTab.ACTIVE} onClick={() => setActiveTab(StakeTab.ACTIVE)}>
            Active {counts.active > 0 && `(${counts.active})`}
          </Tab>
          {account && counts.myCreated > 0 && (
            <Tab active={activeTab === StakeTab.MY_EXPIRED} onClick={() => setActiveTab(StakeTab.MY_EXPIRED)}>
              <Trans>Own Boosts</Trans> ({counts.myCreated})
            </Tab>
          )}
          {account && (
            <Tab active={activeTab === StakeTab.EXPIRED} onClick={() => setActiveTab(StakeTab.EXPIRED)}>
              Expired {counts.expired > 0 && `(${counts.expired})`}
            </Tab>
          )}
          <Tab active={activeTab === StakeTab.POOLS} onClick={() => setActiveTab(StakeTab.POOLS)}>
            Pools {counts.pools > 0 && `(${counts.pools})`}
          </Tab>
        </TabContainer>
        
        <TabContent>
          {activeTab === StakeTab.ACTIVE && (
            <AutoColumn gap="md">
              {loading ? (
                <Loader />
              ) : !activeIncentives ? (
                <ThemedText.DeprecatedBody>
                  <Trans>Error loading programs</Trans>
                </ThemedText.DeprecatedBody>
              ) : Object.keys(activeIncentives).length === 0 ? (
                <ThemedText.DeprecatedBody color={theme.textSecondary} textAlign="center" padding="40px">
                  <Trans>No active programs available</Trans>
                </ThemedText.DeprecatedBody>
              ) : (
                <ProgramSection>
                  {Object.keys(activeIncentives).map((poolAddress) => (
                    <ProgramCard
                      key={poolAddress + '-program-overview'}
                      poolAddress={poolAddress}
                      incentives={activeIncentives[poolAddress]}
                    />
                  ))}
                </ProgramSection>
              )}
            </AutoColumn>
          )}
          
          {activeTab === StakeTab.MY_EXPIRED && userCreatedIncentives && (
            <AutoColumn gap="md">
              <ThemedText.DeprecatedBody fontSize="14px" color={theme.textSecondary} marginBottom="16px">
                <Trans>Manage your created incentive programs</Trans>
              </ThemedText.DeprecatedBody>
              <ProgramSection>
                {Object.keys(userCreatedIncentives).map((poolAddress) => (
                  <UserProgramCard
                    key={poolAddress + '-user-program-overview'}
                    poolAddress={poolAddress}
                    incentives={userCreatedIncentives[poolAddress]}
                  />
                ))}
              </ProgramSection>
            </AutoColumn>
          )}
          
          {activeTab === StakeTab.EXPIRED && (
            <AutoColumn gap="md">
              {!account ? (
                <ThemedText.DeprecatedBody color={theme.textSecondary} textAlign="center" padding="40px">
                  <Trans>Connect wallet to view expired programs</Trans>
                </ThemedText.DeprecatedBody>
              ) : loading ? (
                <Loader />
              ) : !allExpiredIncentives || Object.keys(allExpiredIncentives).length === 0 ? (
                <ThemedText.DeprecatedBody color={theme.textSecondary} textAlign="center" padding="40px">
                  <Trans>No expired programs</Trans>
                </ThemedText.DeprecatedBody>
              ) : (
                <>
                  <ThemedText.DeprecatedBody fontSize="14px" color={theme.textSecondary} marginBottom="16px">
                    <Trans>Check if you have positions to unstake from expired incentive programs</Trans>
                  </ThemedText.DeprecatedBody>
                  <ProgramSection>
                    {Object.keys(paginatedExpiredIncentives.data).map((poolAddress) => (
                      <ExpiredProgramCard
                        key={poolAddress + '-all-expired-program-overview'}
                        poolAddress={poolAddress}
                        incentives={paginatedExpiredIncentives.data[poolAddress]}
                      />
                    ))}
                  </ProgramSection>
                  {paginatedExpiredIncentives.totalPages > 1 && (
                    <PaginationContainer>
                      <PaginationButton
                        disabled={expiredPage === 1}
                        onClick={() => setExpiredPage(expiredPage - 1)}
                      >
                        <Trans>Previous</Trans>
                      </PaginationButton>
                      <PageInfo>
                        <Trans>Page {expiredPage} of {paginatedExpiredIncentives.totalPages}</Trans>
                      </PageInfo>
                      <PaginationButton
                        disabled={expiredPage === paginatedExpiredIncentives.totalPages}
                        onClick={() => setExpiredPage(expiredPage + 1)}
                      >
                        <Trans>Next</Trans>
                      </PaginationButton>
                    </PaginationContainer>
                  )}
                </>
              )}
            </AutoColumn>
          )}
          
          {activeTab === StakeTab.POOLS && (
            <AutoColumn gap="lg">
              <TitleRow style={{ padding: '0' }}>
                <ThemedText.HeadlineSmall justifySelf="flex-start">
                  <Trans>All Pools</Trans>
                </ThemedText.HeadlineSmall>
                <MobileHeader style={{ whiteSpace: 'nowrap' }}>
                  <Trans>Total Volume</Trans>
                </MobileHeader>
                <MobileHeader>
                  <Trans>TVL USD</Trans>
                </MobileHeader>
              </TitleRow>
              {poolsLoading ? (
                <Loader />
              ) : !allPools || allPools.length === 0 ? (
                <ThemedText.DeprecatedBody color={theme.textSecondary} textAlign="center" padding="40px">
                  <Trans>No pools available</Trans>
                </ThemedText.DeprecatedBody>
              ) : (
                <>
                  <ProgramSection>
                    {paginatedPools.data.map((pool: any) => <PoolListItem key={pool.id.toString()} {...pool} />)}
                  </ProgramSection>
                  {paginatedPools.totalPages > 1 && (
                    <PaginationContainer>
                      <PaginationButton
                        disabled={poolsPage === 1}
                        onClick={() => setPoolsPage(poolsPage - 1)}
                      >
                        <Trans>Previous</Trans>
                      </PaginationButton>
                      <PageInfo>
                        <Trans>Page {poolsPage} of {paginatedPools.totalPages}</Trans>
                      </PageInfo>
                      <PaginationButton
                        disabled={poolsPage === paginatedPools.totalPages}
                        onClick={() => setPoolsPage(poolsPage + 1)}
                      >
                        <Trans>Next</Trans>
                      </PaginationButton>
                    </PaginationContainer>
                  )}
                </>
              )}
            </AutoColumn>
          )}
        </TabContent>
      </MainContentWrapper>
    </PageWrapper>
  )
}
