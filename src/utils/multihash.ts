import bs58 from 'bs58'

/**
 * @typedef {Object} Multihash
 * @property {string} digest The digest output of hash function in hex with prepended '0x'
 * @property {number} hashFunction The hash function code for the function used
 * @property {number} size The length of digest
 */

interface Multihash {
  digest: string
  hashFunction: number
  size: number
}

/**
 * Partition multihash string into object representing multihash
 *
 * @param {string} multihash A base58 encoded multihash string
 * @returns {Multihash}
 */
export function getBytes32FromMultiash(multihash: string): Multihash {
  const decoded = bs58.decode(multihash)

  return {
    digest: `0x${decoded.subarray(2).toString('hex')}`,
    hashFunction: decoded[0],
    size: decoded[1],
  }
}

/**
 * Encode a multihash structure into base58 encoded multihash string
 *
 * @param {Multihash} multihash
 * @returns {(string|null)} base58 encoded multihash string
 */
export function getMultihashFromBytes32(multihash: Multihash): string | null {
  const { digest, hashFunction, size } = multihash
  if (size === 0) return null

  // cut off leading "0x"
  const hashBytes = Buffer.from(digest.slice(2), 'hex')

  // prepend hashFunction and digest size
  const multihashBytes = new Uint8Array(2 + hashBytes.length)
  multihashBytes[0] = hashFunction
  multihashBytes[1] = size
  multihashBytes.set(hashBytes, 2)

  return bs58.encode(multihashBytes)
}

/**
 * Parse Solidity response in array to a Multihash object
 *
 * @param {array} response Response array from Solidity
 * @returns {Multihash} multihash object
 */
export function parseContractResponse(response: any[]): Multihash {
  const [digest, hashFunction, size, id] = response
  return {
    digest,
    hashFunction: hashFunction.toNumber(),
    size: size.toNumber(),
  }
}

/**
 * Parse Solidity response in array to a base58 encoded multihash string
 *
 * @param {array} response Response array from Solidity
 * @returns {string} base58 encoded multihash string
 */
export function getMultihashFromContractResponse(response: any[]): string | null {
  return getMultihashFromBytes32(parseContractResponse(response))
}
