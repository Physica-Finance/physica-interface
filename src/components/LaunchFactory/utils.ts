export async function fetchMetaFromPinataIPFS(hash: string) {
  const url = `https://ipfs.io/ipfs/${hash}`
  const response = await fetch(url)
  return await response.json()
}

export async function fetchImageFromPinataIPFS(hash: string) {
  const url = `https://ipfs.io/ipfs/${hash}`
  const response = await fetch(url)
  return await response.blob()
}
