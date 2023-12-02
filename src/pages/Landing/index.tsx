import { Trans } from '@lingui/macro'
import { Trace, TraceEvent } from '@uniswap/analytics'
import { BrowserEvent, InterfaceElementName, InterfacePageName, SharedEventName } from '@uniswap/analytics-events'
import { AboutFooter } from 'components/About/AboutFooter'
import Card, { CardType } from 'components/About/Card'
import { MAIN_CARDS, MORE_CARDS } from 'components/About/constants'
import ProtocolBanner from 'components/About/ProtocolBanner'
import { BaseButton } from 'components/Button'
import { useSwapWidgetEnabled } from 'featureFlags/flags/swapWidget'
import { useAtomValue } from 'jotai/utils'
import Swap from 'pages/Swap'
import { parse } from 'qs'
import { useEffect, useRef, useState } from 'react'
import { ArrowDownCircle } from 'react-feather'
import { useLocation, useNavigate } from 'react-router-dom'
import { Link as NativeLink } from 'react-router-dom'
import { shouldDisableNFTRoutesAtom } from 'state/application/atoms'
import { useAppSelector } from 'state/hooks'
import styled, { css } from 'styled-components/macro'
import { BREAKPOINTS } from 'theme'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { Z_INDEX } from 'theme/zIndex'
import darkImage from '../../assets/images/img-hero.svg'
import lightImage from '../../assets/images/img-hero.svg'

const Image = styled.img`
  max-width: 500px;
  width: 100%;
  height: 100%;
  max-height : 100vh;
  // padding: 0 75px;
  // margin-left: 30px;
`

const PageContainer = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  top: 0;
  padding: ${({ theme }) => theme.navHeight}px 0px 0px 0px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  scroll-behavior: smooth;
  overflow-x: hidden;

  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'linear-gradient(rgba(8, 10, 24, 0) 0%, rgb(8 10 24 / 100%) 45%)'
      : 'linear-gradient(rgba(255, 255, 255, 0) 0%, rgb(255 255 255 /100%) 45%)'};
`

const Gradient = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  bottom: 0;
  width: 100%;
  min-height: 550px;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'linear-gradient(rgba(8, 10, 24, 0) 0%, rgb(8 10 24 / 100%) 45%)'
      : 'linear-gradient(rgba(255, 255, 255, 0) 0%, rgb(255 255 255 /100%) 45%)'};
  z-index: ${Z_INDEX.under_dropdown};
  pointer-events: none;
  height: ${({ theme }) => `calc(100vh - ${theme.mobileBottomBarHeight}px)`};
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    height: 100vh;
  }
`

const GlowContainer = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  bottom: 0;
  width: 100%;
  overflow-y: hidden;
  height: ${({ theme }) => `calc(100vh - ${theme.mobileBottomBarHeight}px)`};
  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    height: 100vh;
  }
`

const Glow = styled.div`
  position: absolute;
  top: 68px;
  bottom: 0;
  background: radial-gradient(72.04% 72.04% at 50% 3.99%, #ff37eb 0%, rgba(166, 151, 255, 0) 100%);
  filter: blur(72px);
  border-radius: 24px;
  max-width: 200px;
  width: 100%;
  height: 100%;
`

const ContentContainer = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  padding: 0 50px;
  // max-width: min(720px, 90%);
  z-index: ${Z_INDEX.under_dropdown};
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} opacity`};
  height: ${({ theme }) => `calc(100vh - ${theme.navHeight + theme.mobileBottomBarHeight}px)`};
  pointer-events: none;
  * {
    pointer-events: auto;
  }
`

const ChildContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  padding: 0;
  // max-width: min(720px, 90%);
  z-index: ${Z_INDEX.under_dropdown};
  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} opacity`};
  height: ${({ theme }) => `calc(100vh - ${theme.navHeight + theme.mobileBottomBarHeight}px)`};
  pointer-events: none;
  * {
    pointer-events: auto;
  }
`

const TitleText = styled.h1<{ isDarkMode: boolean }>`
  color: transparent;
  font-size: 36px;
  line-height: 44px;
  font-weight: 700;
  text-align: left;
  margin: 0 0 24px;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? '#FFF'
      : '#AEF'};
  background-clip: text;
  -webkit-background-clip: text;

  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    font-size: 48px;
    line-height: 56px;
  }

  @media screen and (min-width: ${BREAKPOINTS.md}px) {
    font-size: 64px;
    line-height: 72px;
  }
`

const SubText = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  text-align: left;
  max-width: 600px;
  margin: 0 0 32px;

  @media screen and (min-width: ${BREAKPOINTS.md}px) {
    font-size: 20px;
    line-height: 28px;
  }
`

const SubTextContainer = styled.div`
  display: flex;
  justify-content: left;
`

const LandingButton = styled(BaseButton)`
  padding: 16px 0px;
  border-radius: 30px;
`

const ButtonCTA = styled(LandingButton)`
  background: #3671E9;
  box-shadow: 0px 3px 4px 0px rgba(54, 113, 233, 0.50);
  border: none;
  width: 60%;
  color: ${({ theme }) => theme.white};
  transition: ${({ theme }) => `all ${theme.transition.duration.medium} ${theme.transition.timing.ease}`};

  &:hover {
    box-shadow: 0px 0px 16px 0px rgba(54, 113, 233, 0.50);
  }
`

const ButtonCTAText = styled.p`
  margin: 0px;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;

  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    font-size: 20px;
  }
`

const ActionsContainer = styled.span`
  max-width: 200px;
  width: 100%;
  pointer-events: auto;
`

const LearnMoreContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.textTertiary};
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  margin: 36px 0 0;
  display: flex;
  visibility: hidden;
  pointer-events: auto;
  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    visibility: visible;
  }

  transition: ${({ theme }) => `${theme.transition.duration.medium} ${theme.transition.timing.ease} opacity`};

  &:hover {
    opacity: 0.6;
  }
`

const LearnMoreArrow = styled(ArrowDownCircle)`
  margin-left: 14px;
  size: 20px;
`

const AboutContentContainer = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px 5rem;
  width: 100%;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'linear-gradient(179.82deg, rgba(0, 0, 0, 0) 0.16%, #050026 99.85%)'
      : 'linear-gradient(179.82deg, rgba(255, 255, 255, 0) 0.16%, #eaeaea 99.85%)'};
  @media screen and (min-width: ${BREAKPOINTS.md}px) {
    padding: 0 96px 5rem;
  }
`

const CardGrid = styled.div<{ cols: number }>`
  display: grid;
  gap: 12px;
  width: 100%;
  padding: 24px 0 0;
  max-width: 1440px;
  scroll-margin: ${({ theme }) => `${theme.navHeight}px 0 0`};

  grid-template-columns: 1fr;
  @media screen and (min-width: ${BREAKPOINTS.sm}px) {
    // At this screen size, we show up to 2 columns.
    grid-template-columns: ${({ cols }) =>
      Array.from(Array(cols === 2 ? 2 : 1))
        .map(() => '1fr')
        .join(' ')};
    gap: 32px;
  }

  @media screen and (min-width: ${BREAKPOINTS.lg}px) {
    // at this screen size, always show the max number of columns
    grid-template-columns: ${({ cols }) =>
      Array.from(Array(cols))
        .map(() => '1fr')
        .join(' ')};
    gap: 32px;
  }
`

const LandingSwapContainer = styled.div`
  height: ${({ theme }) => `calc(100vh - ${theme.mobileBottomBarHeight}px)`};
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
`

const SwapCss = css`
  * {
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    transition: ${({ theme }) => `transform ${theme.transition.duration.medium} ${theme.transition.timing.ease}`};
  }
`

const LinkCss = css`
  text-decoration: none;
  max-width: 480px;
  width: 100%;
`

const LandingSwap = styled(Swap)`
  ${SwapCss}
  &:hover {
    border: 1px solid ${({ theme }) => theme.accentAction};
  }
`

const Link = styled(NativeLink)`
  ${LinkCss}
`

const WidgetLandingLink = styled(NativeLink)`
  ${LinkCss}
  ${SwapCss}
`

export default function Landing() {
  const isDarkMode = useIsDarkMode()

  const cardsRef = useRef<HTMLDivElement>(null)

  const [showContent, setShowContent] = useState(false)
  const selectedWallet = useAppSelector((state) => state.user.selectedWallet)
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = parse(location.search, {
    ignoreQueryPrefix: true,
  })

  const swapWidgetEnabled = useSwapWidgetEnabled()

  // This can be simplified significantly once the flag is removed! For now being explicit is clearer.
  useEffect(() => {
    if (queryParams.intro || !selectedWallet) {
      setShowContent(true)
    } else {
      navigate('/swap')
    }
  }, [navigate, selectedWallet, queryParams.intro])

  const shouldDisableNFTRoutes = useAtomValue(shouldDisableNFTRoutesAtom)

  return (
    <Trace page={InterfacePageName.LANDING_PAGE} shouldLogImpression>
      {showContent && (
        <PageContainer isDarkMode={isDarkMode} data-testid="landing-page">
          <LandingSwapContainer>
            {/* <TraceEvent
              events={[BrowserEvent.onClick]}
              name={SharedEventName.ELEMENT_CLICKED}
              element={InterfaceElementName.LANDING_PAGE_SWAP_ELEMENT}
            >
              {swapWidgetEnabled ? (
                <WidgetLandingLink to="/swap">
                  <Swap />
                </WidgetLandingLink>
              ) : (
                <Link to="/swap">
                  <LandingSwap />
                </Link>
              )}
            </TraceEvent> */}
          </LandingSwapContainer>
          <Gradient isDarkMode={isDarkMode} />
          {/* <GlowContainer> */}
            {/* <Glow /> */}
          {/* </GlowContainer> */}
          <ContentContainer isDarkMode={isDarkMode}>
            <ChildContainer>
            <TitleText isDarkMode={isDarkMode}>
              {shouldDisableNFTRoutes ? (
                <>
                  <span style={{ color: '#FFF' }}>
                    <Trans>Physica</Trans>
                  </span>{' '}
                  <span style={{ color: '#AEF' }}>
                    <Trans>Finance</Trans>
                  </span>
                </>
              ) : (
                <>
                  <span style={{ color: '#FFF' }}>
                    <Trans>Physica</Trans>
                  </span>{' '}
                  <span style={{ color: '#AEF' }}>
                    <Trans>Finance</Trans>
                  </span>
                </>
              )}
            </TitleText>
            <SubTextContainer>
              <SubText>
                {shouldDisableNFTRoutes ? (
                  <Trans>The all-in-one DeFi hub on Planq</Trans>
                ) : (
                  <Trans>The all-in-one DeFi hub on Planq</Trans>
                )}
              </SubText>
            </SubTextContainer>
            <ActionsContainer>
              <TraceEvent
                events={[BrowserEvent.onClick]}
                name={SharedEventName.ELEMENT_CLICKED}
                element={InterfaceElementName.CONTINUE_BUTTON}
              >
                <ButtonCTA as={Link} to="/swap">
                  <ButtonCTAText>
                    <Trans>Get Started</Trans>
                  </ButtonCTAText>
                </ButtonCTA>
              </TraceEvent>
            </ActionsContainer>
            </ChildContainer>
            <Image src={isDarkMode ? darkImage : lightImage} alt="Liluni" />
            {/* <LearnMoreContainer
              onClick={() => {
                cardsRef?.current?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <Trans>Learn more</Trans>
              <LearnMoreArrow />
            </LearnMoreContainer> */}
          </ContentContainer>
          <AboutContentContainer isDarkMode={isDarkMode}>
            {/* <CardGrid cols={2} ref={cardsRef}>
              {MAIN_CARDS.map(({ darkBackgroundImgSrc, lightBackgroundImgSrc, ...card }) => (
                <Card
                  {...card}
                  backgroundImgSrc={isDarkMode ? darkBackgroundImgSrc : lightBackgroundImgSrc}
                  key={card.title}
                />
              ))}
            </CardGrid> */}
            <CardGrid cols={3}>
              {MORE_CARDS.map(({ darkIcon, lightIcon, ...card }) => (
                <Card {...card} icon={isDarkMode ? darkIcon : lightIcon} key={card.title} type={CardType.Secondary} />
              ))}
            </CardGrid>
            <ProtocolBanner />
            <AboutFooter />
          </AboutContentContainer>
        </PageContainer>
      )}
    </Trace>
  )
}
