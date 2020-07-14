import axios from 'axios'
import fs from 'fs'
import jsdom from 'jsdom'
import https from 'https'

const instance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});

instance.defaults.timeout = 1000


const { JSDOM } = jsdom
const file = fs.readFileSync('twitter-friends.cache.json', 'utf8')
const users = JSON.parse(file)


async function handleItem(user) {
  try {
    const homepageRequest = await instance.get(user.url)
    const responseUrl = homepageRequest.request.res.responseUrl
    console.log(`>>>> got html for ${user.name}: `, responseUrl)
    const dom = new JSDOM(homepageRequest.data);
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

  const results = await Promise.all(users.map(handleItem))

  console.log("results: ", results)

  fs.writeFileSync("resolved-data.cache.json", JSON.stringify(results))
}

run()
