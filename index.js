import dotenv from 'dotenv'
import Twitter from 'twitter-lite';
import r from 'ramda'
import fs from 'fs'

dotenv.config()

const client = new Twitter({
  ubdomain: "api", // "api" is the default (change for other subdomains)
    version: "1.1", // version "1.1" is the default (change for other subdomains)
    consumer_key: process.env.consumer_key, // from Twitter.
    consumer_secret: process.env.consumer_secret, // from Twitter.
    access_token_key: process.env.access_token_key, // from your User (oauth_token)
    access_token_secret: process.env.access_token_secret // from your User (oauth_token_secret)
})

async function run() {
  const result =  await client.get("friends/list", {count: 200})

  const users = r.pipe(
    r.filter(x => x.url !== null),
    r.map(r.pick(["name", "screen_name", "description", "url"]))
  )( result.users)
  const headers = result._headers

  console.log('>>> results: ', users)  
  console.log('>>> headers: ', headers)

  fs.writeFileSync('result.json', JSON.stringify(users))
  console.log('written to result.json')


}

run()
