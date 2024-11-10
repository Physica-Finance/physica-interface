//export const UNI_LIST = 'https://tokens.uniswap.org'
const UNI_EXTENDED_LIST = 'https://gateway.ipfs.io/ipns/extendedtokens.uniswap.org'
const UNI_UNSUPPORTED_LIST = 'https://unsupportedtokens.uniswap.org/'

export const PLANQ_LIST = 'https://raw.githubusercontent.com/Physica-Finance/token-list/main/token.json'
export const CELO_LIST = 'https://celo-org.github.io/celo-token-list/celo.tokenlist.json'

export const UNSUPPORTED_LIST_URLS: string[] = [UNI_UNSUPPORTED_LIST]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [PLANQ_LIST]
export const DEFAULT_INACTIVE_LIST_URLS: string[] = [UNI_EXTENDED_LIST, CELO_LIST, ...UNSUPPORTED_LIST_URLS]

export const DEFAULT_LIST_OF_LISTS: string[] = [...DEFAULT_ACTIVE_LIST_URLS, ...DEFAULT_INACTIVE_LIST_URLS]
