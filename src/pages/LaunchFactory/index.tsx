import { Trans } from '@lingui/macro'
import { Trace } from '@uniswap/analytics'
import { InterfacePageName } from '@uniswap/analytics-events'
import { MAX_WIDTH_MEDIA_BREAKPOINT, MEDIUM_MEDIA_BREAKPOINT } from 'components/LaunchFactory/constants'
import { filterStringAtom } from 'components/LaunchFactory/state'
import SearchBar from 'components/LaunchFactory/TokenTable/SearchBar'
import TokenTable from 'components/LaunchFactory/TokenTable/TokenTable'
import { MouseoverTooltip } from 'components/Tooltip'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'
import { ButtonPrimary } from '../../components/Button'
import LaunchTokenModal from '../../components/LaunchFactory/LaunchTokenModal'
import { TitleRow } from '../Pool'
import { AutoColumn } from '../../components/Column'
import { useWeb3React } from '@web3-react/core'

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

const LaunchFactoryTokens = () => {
  const resetFilterString = useResetAtom(filterStringAtom)
  const location = useLocation()
  const { account } = useWeb3React()
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
                  text={<Trans>This table contains the newly launched tokens by creation date.</Trans>}
                  placement="bottom"
                >
                  <ThemedText.LargeHeader>
                    <Trans>Token Launchpad</Trans>
                  </ThemedText.LargeHeader>
                  <ThemedText.SubHeaderSmall>
                    For real time updates join the{' '}
                    <a href={'https://t.me/physica_launchpad'} target={'_blank'}>
                      launchpad telegram channel.
                    </a>
                  </ThemedText.SubHeaderSmall>
                </MouseoverTooltip>
                <ResponsiveButtonPrimary disabled={!account} onClick={() => setShowLaunchTokenModal(true)}>
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

export default LaunchFactoryTokens
