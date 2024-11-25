import React, { ChangeEvent, useCallback } from 'react'
import styled from 'styled-components/macro'

const Input = styled.input<{ error?: boolean; fontSize?: string }>`
  font-size: ${({ fontSize }) => fontSize || '1.25rem'};
  outline: none;
  border: none;
  flex: 1 1 auto;
  width: 0;
  background-color: ${({ theme }) => theme.deprecated_bg1};
  transition: color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  color: ${({ error, theme }) => (error ? theme.accentFailure : theme.textPrimary)};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: 100%;
  padding: 0px;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.deprecated_text4};
  }
`

export const FileUploadInput = ({
  className,
  onUserInput,
  placeholder,
  fontSize,
}: {
  className?: string
  onUserInput: (value: File | null) => void
  placeholder: string
  fontSize: string
}) => {
  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onUserInput((event.target.files ?? [])[0] || null)
    },
    [onUserInput]
  )

  return (
    <div className={className}>
      <Input
        type="file"
        autoComplete="off"
        autoCorrect="off"
        accept="image/*"
        autoCapitalize="off"
        spellCheck="false"
        placeholder={placeholder || ''}
        onChange={handleInput}
        fontSize={fontSize}
      />
    </div>
  )
}
