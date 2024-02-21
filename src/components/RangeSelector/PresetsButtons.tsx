import { Trans } from '@lingui/macro'
import { ButtonOutlined } from 'components/Button'
import { AutoRow } from 'components/Row'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

const Button = styled(ButtonOutlined).attrs(() => ({
  padding: '8px',
  $borderRadius: '8px',
}))`
  color: ${({ theme }) => theme.textPrimary};
  flex: 1;
`

interface PresetsButtonsProps {
  onSetFullRange: () => void
  onSetEasyRange: () => void
  onSetMediumRange: () => void
  onSetHardcoreRange: () => void
}

export default function PresetsButtons({
  onSetFullRange,
  onSetEasyRange,
  onSetMediumRange,
  onSetHardcoreRange,
}: PresetsButtonsProps) {
  return (
    <AutoRow gap="4px" width="auto">
      <Button onClick={onSetFullRange}>
        <ThemedText.DeprecatedBody fontSize={12}>
          <Trans>Full</Trans>
        </ThemedText.DeprecatedBody>
      </Button>
      <Button onClick={onSetEasyRange}>
        <ThemedText.DeprecatedBody fontSize={12}>
          <Trans>Easy</Trans>
        </ThemedText.DeprecatedBody>
      </Button>
      <Button onClick={onSetMediumRange}>
        <ThemedText.DeprecatedBody fontSize={12}>
          <Trans>Medium</Trans>
        </ThemedText.DeprecatedBody>
      </Button>
      <Button onClick={onSetHardcoreRange}>
        <ThemedText.DeprecatedBody fontSize={12}>
          <Trans>Hard</Trans>
        </ThemedText.DeprecatedBody>
      </Button>
    </AutoRow>
  )
}
