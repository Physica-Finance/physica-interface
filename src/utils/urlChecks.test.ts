import { hasURL } from './urlChecks'

test('hasURL', () => {
  expect(hasURL('this is my personal website: https://www.example.com')).toBe(true)
  expect(hasURL('#corngang')).toBe(false)
  expect(hasURL('http://username:password@Physica.finance.org')).toBe(true)
  expect(hasURL('http://app.physica.finance')).toBe(true)
  expect(hasURL('Physica.Finance')).toBe(true)
})
