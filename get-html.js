import axios from 'axios'
import fs from 'fs'
import jsdom from 'jsdom'
import https from 'https'
import PProgress from 'p-progress'
import got from 'got'

const { JSDOM } = jsdom
const file = fs.readFileSync('twitter-friends.cache.json', 'utf8')
const users = JSON.parse(file)


async function handleItem(user) {
  try {
    const homepageRequest = await got(user.url, {timeout: 5000})
    const responseUrl = homepageRequest.url
    console.log(`>>>> got html for ${user.name}: `, responseUrl)
    const dom = new JSDOM(homepageRequest.body);
    const feedLinks = Array.from(dom.window.document.querySelectorAll("link[rel=alternate]"))
      .filter(link =>
        link.type === "application/rss+xml" 
        || link.type === "application/atom+xml" 
        || link.type === "application/json"
      )
      .map(link => ({ href: link.href, title: link.title }))
     const result = {...user, shortUrl: user.url, url: responseUrl, feedLinks}
     return result
     
  } catch (error) {
    console.error(`>>>> error for ${user.name} (${user.url}) `)
    return user
  }
}

async function run() {
  const allFeedsPromise = PProgress.all(users.map(handleItem))
  allFeedsPromise.onProgress(console.log)
  const results = await allFeedsPromise



  console.log("results: ", results)

  fs.writeFileSync("resolved-data.cache.json", JSON.stringify(results))
}

run()
