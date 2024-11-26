import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfacePageName } from '@uniswap/analytics-events'
import { MAX_WIDTH_MEDIA_BREAKPOINT, MEDIUM_MEDIA_BREAKPOINT } from 'components/Tokens/constants'
import { filterStringAtom } from 'components/Tokens/state'
import SearchBar from 'components/Tokens/TokenTable/SearchBar'
import TokenTable from 'components/Tokens/TokenTable/TokenTable'
import { MouseoverTooltip } from 'components/Tooltip'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { ButtonPrimary } from '../../components/Button'
import LaunchTokenModal from '../../components/Tokens/LaunchFactory/LaunchTokenModal'
import { TitleRow } from '../Pool'
import { AutoColumn } from '../../components/Column'

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

const ExploreContainer = styled.div`
  width: 100%;
  min-width: 320px;
  padding: 68px 12px 0px;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    padding-top: 48px;
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.sm}px`}) {
    padding-top: 20px;
  }
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  border-radius: 12px;

  padding: 6px 8px;
  width: fit-content;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    flex: 1 1 auto;
    width: 100%;
  `};
`

const TitleContainer = styled.div`
  margin-bottom: 32px;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: space-between;
`
const FiltersContainer = styled.div`
  display: flex;
  gap: 8px;
  height: 40px;

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    order: 2;
  }
`
const SearchContainer = styled(FiltersContainer)`
  margin-left: 8px;
  width: 100%;

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    margin: 0px;
    order: 1;
  }
`
const FiltersWrapper = styled.div`
  display: flex;
  max-width: ${MAX_WIDTH_MEDIA_BREAKPOINT};

  margin-bottom: 20px;
  color: ${({ theme }) => theme.textTertiary};
  flex-direction: row;

  @media only screen and (max-width: ${MEDIUM_MEDIA_BREAKPOINT}) {
    flex-direction: column;
    gap: 8px;
  }
`

const Tokens = () => {
  const resetFilterString = useResetAtom(filterStringAtom)
  const location = useLocation()
  const [showLaunchTokenModal, setShowLaunchTokenModal] = useState(false)
  useEffect(() => {
    resetFilterString()
  }, [location, resetFilterString])

  return (
    <>
      <LaunchTokenModal isOpen={showLaunchTokenModal} onDismiss={() => setShowLaunchTokenModal(false)} />
      <Trace page={InterfacePageName.TOKENS_PAGE} shouldLogImpression>
        <PageWrapper>
          <AutoColumn gap="lg" justify="center">
            <AutoColumn gap="lg" style={{ width: '100%' }}>
              <TitleRow padding="0" marginBottom={1}>
                <MouseoverTooltip
                  text={
                    <Trans>This table contains the top tokens by Physica volume, sorted based on your input.</Trans>
                  }
                  placement="bottom"
                >
                  <ThemedText.LargeHeader>
                    <Trans>Top tokens</Trans>
                  </ThemedText.LargeHeader>
                </MouseoverTooltip>
                <ResponsiveButtonPrimary onClick={() => setShowLaunchTokenModal(true)}>
                  {<Trans>Launch Token</Trans>}
                </ResponsiveButtonPrimary>
              </TitleRow>
              <FiltersWrapper>
                <SearchContainer>
                  <SearchBar />
                </SearchContainer>
              </FiltersWrapper>
              <TokenTable />
            </AutoColumn>
          </AutoColumn>
        </PageWrapper>
      </Trace>
    </>
  )
}

export default Tokens
