import { readableColor, transparentize } from 'polished'
import { PropsWithChildren } from 'react'
import styled, { DefaultTheme } from 'styled-components/macro'

export enum BadgeVariant {
  DEFAULT = 'DEFAULT',
  NEGATIVE = 'NEGATIVE',
  POSITIVE = 'POSITIVE',
  PRIMARY = 'PRIMARY',
  WARNING = 'WARNING',

  WARNING_OUTLINE = 'WARNING_OUTLINE',
}

interface BadgeProps {
  variant?: BadgeVariant
}

function pickBackgroundColor(variant: BadgeVariant | undefined, theme: DefaultTheme): string {
  switch (variant) {
    case BadgeVariant.NEGATIVE:
      return theme.accentFailure
    case BadgeVariant.POSITIVE:
      return theme.accentSuccess
    case BadgeVariant.PRIMARY:
      return theme.accentAction
    case BadgeVariant.WARNING:
      return theme.accentWarning
    case BadgeVariant.WARNING_OUTLINE:
      return 'transparent'
    default:
      return theme.backgroundInteractive
  }
}

function pickBorder(variant: BadgeVariant | undefined, theme: DefaultTheme): string {
  switch (variant) {
    case BadgeVariant.WARNING_OUTLINE:
      return `1px solid ${theme.accentWarning}`
    default:
      return 'unset'
  }
}

function pickFontColor(variant: BadgeVariant | undefined, theme: DefaultTheme): string {
  switch (variant) {
    case BadgeVariant.NEGATIVE:
      return readableColor(theme.accentFailure)
    case BadgeVariant.POSITIVE:
      return readableColor(theme.accentSuccess)
    case BadgeVariant.WARNING:
      return readableColor(theme.accentWarning)
    case BadgeVariant.WARNING_OUTLINE:
      return theme.accentWarning
    default:
      return readableColor(theme.backgroundInteractive)
  }
}

const Badge = styled.div<PropsWithChildren<BadgeProps>>`
  align-items: center;
  background-color: ${({ theme, variant }) => pickBackgroundColor(variant, theme)};
  border: ${({ theme, variant }) => pickBorder(variant, theme)};
  border-radius: 0.5rem;
  color: ${({ theme, variant }) => pickFontColor(variant, theme)};
  display: inline-flex;
  padding: 4px 6px;
  justify-content: center;
  font-weight: 500;
`

export default Badge

export const GenericBadge = styled.div`
  display: flex;
  width: fit-content;
  justify-content: center;
  align-items: center;
  padding: 4px 8px;
  border-radius: 8px;
`

export const GreenBadge = styled.div`
  background-color: ${({ theme }) => transparentize(0.86, theme.green1)};
  padding: 6px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  white-space: nowrap;
`

export const BlueBadge = styled.div`
  background-color: ${({ theme }) => transparentize(0.92, theme.blue2)};
  padding: 6px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
`

// slightly transparent
export const EmptyBadge = styled.div`
  background-color: ${({ theme }) => transparentize(0.7, theme.bg3)};
  padding: 6px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`
