/* eslint-env node */

require('dotenv').config({ path: '.env.production' })
const child_process = require('child_process')
const fs = require('fs/promises')
const { promisify } = require('util')
const dataConfig = require('../graphql.config')
const thegraphConfig = require('../graphql_thegraph.config')

const exec = promisify(child_process.exec)

function fetchSchema(url, outputFile) {
  exec(`npx get-graphql-schema --h Origin=https://app.uniswap.org https://api.uniswap.org/v1/graphql`)
    .then(({ stderr, stdout }) => {
      if (stderr) {
        throw new Error(stderr)
      } else {
        stdout = stdout.replace('UNKNOWN_CHAIN', 'PLANQ\n  UNKNOWN_CHAIN')
        fs.writeFile(outputFile, stdout)
      }
    })
    .catch((err) => {
      console.error(err)
      console.error(`Failed to fetch schema from ${url}`)
    })
}

fetchSchema(process.env.THE_GRAPH_SCHEMA_ENDPOINT, thegraphConfig.schema)
fetchSchema(process.env.REACT_APP_AWS_API_ENDPOINT, dataConfig.schema)
