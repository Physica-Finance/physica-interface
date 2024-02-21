/* eslint-disable react/prop-types */
import Web3Status from 'components/Web3Status'
import { useIsNftPage } from 'hooks/useIsNftPage'
import { Box } from 'nft/components/Box'
import { Row } from 'nft/components/Flex'
import { UniIcon } from 'nft/components/icons'
import { useProfilePageState } from 'nft/hooks'
import { ProfilePageStateType } from 'nft/types'
import { ReactNode } from 'react'
import { NavLinkProps, useNavigate } from 'react-router-dom'
import styled from 'styled-components/macro'

import { Bag } from './Bag'
import Blur from './Blur'
import { ChainSelector } from './ChainSelector'
import { PageTabs } from './PageTabs'
import { SearchBar } from './SearchBar'
import * as styles from './style.css'

const Nav = styled.nav`
  padding: 20px 12px;
  width: 100%;
  height: ${({ theme }) => theme.navHeight}px;
  z-index: 2;
`

interface MenuItemProps {
  href: string
  id?: NavLinkProps['id']
  isActive?: boolean
  children: ReactNode
  dataTestId?: string
}

interface MenuItemProps {
  href: string
  dataTestId?: string
  id?: string
  isActive?: boolean
  isTarget?: boolean
  children: React.ReactNode
}

export const MenuItem: React.FC<MenuItemProps> = ({ href, dataTestId, id, isActive, children, isTarget = true }) => {
  // const isExternalLink = href.startsWith('https') || href.startsWith('//')

  // const linkProps = isExternalLink
  //   ? {
  //       href,
  //       target: '_blank',
  //       rel: 'noopener noreferrer',
  //     }
  //   : {
  //       to: href,
  //     }

  return (
    <a
      href={href}
      target={isTarget == true ? '_blank' : ''}
      className={isActive ? styles.activeMenuItem : styles.menuItem}
      id={id}
      style={{ textDecoration: 'none' }}
      data-testid={dataTestId}
      rel="noreferrer"
    >
      {children}
    </a>
  )
}

const Navbar = ({ blur }: { blur: boolean }) => {
  const isNftPage = useIsNftPage()
  const sellPageState = useProfilePageState((state) => state.state)
  const navigate = useNavigate()

  return (
    <>
      {blur && <Blur />}
      <Nav>
        <Box display="flex" height="full" flexWrap="nowrap">
          <Box className={styles.leftSideContainer}>
            <Box className={styles.logoContainer}>
              <UniIcon
                width="200"
                height="48"
                data-testid="uniswap-logo"
                className={styles.logo}
                onClick={() => {
                  window.location.href = 'https://physica.finance/'
                }}
              />
            </Box>
            {!isNftPage && (
              <Box display={{ sm: 'flex', lg: 'none' }}>
                <ChainSelector leftAlign={true} />
              </Box>
            )}
            <Row display={{ sm: 'none', lg: 'flex' }}>
              <PageTabs />
            </Row>
          </Box>
          {/* <Box className={styles.searchContainer}>
            <SearchBar />
          </Box> */}
          <Box className={styles.rightSideContainer}>
            <Row gap="12">
              <Box position="relative" display={{ sm: 'flex', navSearchInputVisible: 'none' }}>
                <SearchBar />
              </Box>
              {isNftPage && sellPageState !== ProfilePageStateType.LISTING && <Bag />}
              {!isNftPage && (
                <Box display={{ sm: 'none', lg: 'flex' }}>
                  <ChainSelector />
                </Box>
              )}

              <Web3Status />
            </Row>
          </Box>
        </Box>
      </Nav>
    </>
  )
}

// eslint-disable-next-line import/no-unused-modules
export default Navbar
