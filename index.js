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
  const firstPage =  await client.get("friends/list", {count: 200})

  let cursor = firstPage.next_cursor

  const getUserData = r.pipe(
    r.filter(x => x.url !== null),
    r.map(r.pick(["name", "screen_name", "description", "url"]))
  )

  let users = getUserData( firstPage.users)
  let headers = firstPage._headers

  // console.log('>>> results: ', users)  
  console.log('>>> headers: ', headers)
  console.log('>>> users length: ', firstPage.users.length)

  while (cursor > 0) {
    console.log(">>>> cursor: ", cursor)
    const currentPage = await client.get("friends/list", {count: 200, cursor})
    const pageUsers = getUserData(currentPage.users)
    users = users.concat(pageUsers)
    cursor = currentPage.next_cursor
    headers = currentPage._headers
    console.log('>>> users length: ', currentPage.users.length)
  }

  console.log(">>>> got all pages, now cursor: ", cursor)
  console.log('>>> headers for last page: ', headers)

  fs.writeFileSync('twitter-friends.cache.json', JSON.stringify(users))
  console.log('written to twitter-friends.cache.json')


}

run()
