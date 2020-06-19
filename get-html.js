import axios from 'axios'
import fs from 'fs'
import jsdom from 'jsdom'
import https from 'https'

const instance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});


const { JSDOM } = jsdom
const file = fs.readFileSync('result.json', 'utf8')
const users = JSON.parse(file)


async function run() {
  console.log('>>> read users count: ', users.length)
  for (let x of users) {
    try {
      const result = await instance.get(x.url)
      console.log(`>>>> got html for ${x.name}: `, result.request.res.responseUrl)
      const dom = new JSDOM(result.data);
      const links = Array.from(dom.window.document.querySelectorAll("link[rel=alternate]"))
        .filter(x =>
          x.type === "application/rss+xml" 
          || x.type === "application/atom+xml" 
          || x.type === "application/json"
        )
        .map(x => x.href)

      console.log('>>> ', links);
    } catch (error) {
      console.error(`>>>> error for ${x.name}: `, error)
    }
  }
}

run()
