import { AutoColumn } from '../../components/Column'
import styled, { useTheme } from 'styled-components/macro'
import { AutoRow, RowBetween, RowFixed } from '../../components/Row'
import { CardSection, DataCard, CardBGImage, OverviewGrid } from '../../components/earn/styled'
import { DarkCard } from '../../components/Card'
import { Trans } from '@lingui/macro'
import { GenericBadge } from 'components/Badge'
import { Zap } from 'react-feather'
import { useAllIncentivesByPool } from '../../hooks/incentives/useAllIncentives'
import ProgramCard from '../../components/earn/ProgramCard'
import Loader from 'components/Loader'
import { ButtonGreySmall } from 'components/Button'
import { ThemedText } from 'theme'
import { Link } from 'react-router-dom'
import { currencyId } from '../../utils/currencyId'

const PageWrapper = styled(AutoColumn)`
  max-width: 840px;
  width: 100%;
`

const TopSection = styled(AutoColumn)`
  width: 100%;
`

const ProgramSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 12px;
  width: 100%;
  justify-self: center;
`

export default function Stake() {
  const theme = useTheme()

  const { loading, incentives } = useAllIncentivesByPool()

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <RowBetween>
          <ThemedText.DeprecatedBody style={{ marginTop: '0.5rem' }} fontSize="20px" color={theme.textTertiary}>
            <Trans>Boosted Pools</Trans>
          </ThemedText.DeprecatedBody>
          <AutoRow gap="6px" width="fit-content">
            <ButtonGreySmall>Find Program</ButtonGreySmall>
            <ButtonGreySmall as={Link}
                             to={`/program`}>New Program</ButtonGreySmall>
          </AutoRow>
        </RowBetween>
        <DataCard>
          <CardSection>
            <AutoColumn gap="md">
              <GenericBadge style={{ backgroundColor: theme.deprecated_blue4 }}>
                <RowFixed>
                  <Zap stroke={theme.deprecated_blue4} size="16px" strokeWidth={'3px'} />
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
      <DarkCard padding="24px">
        <AutoColumn gap="16px">
          <OverviewGrid style={{ padding: '0' }}>
            <ThemedText.DeprecatedBody justifySelf="flex-start" fontSize="14px">
              <Trans>Active Programs</Trans>
            </ThemedText.DeprecatedBody>
            <ThemedText.DeprecatedBody fontSize="14px" style={{ whiteSpace: 'nowrap' }}>
              <Trans>7D Active Liquidity</Trans>
            </ThemedText.DeprecatedBody>
            <ThemedText.DeprecatedBody fontSize="14px">
              <Trans>Rewards Rate</Trans>
            </ThemedText.DeprecatedBody>
          </OverviewGrid>
          <ProgramSection>
            {loading ? (
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
    </PageWrapper>
  )
}
