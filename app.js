const express = require("express");
const app = express();
const cors = require("cors");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const urlParser = require("url")
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(express.json());
app.get("/api/v1", async (req, res) => {
    res.send({message: "Hello World!"});
})
app.post("/api/v1/getDead", async (req, res) => {
  const url = req.body.newUrl

    const newUrls = req.body.subdomains

    const getUrl = (link) => {
        if (link.includes('http')) {
            return link
        } else if (link.startsWith('/')) {
            // console.log(`SHOURTCUT ${link}` )
            return `${url}/${link}`
        } else {
            return `${url}/${link}`
        }
    }

    const seenUrls = {}
    const foundOldLinks = {}
    let crawlCount = 0
    let pageFinished
    const crawl = async (url) => {
        pageFinished = false
        console.log(`CRAWLING ${url}`)
        seenUrls[url] = true
        crawlCount++
        const res = await fetch(url)
        const html = await res.text()
        const $ = cheerio.load(html)
        const links = $("a").map((i, link) => link.attribs.href).get()

        const { host } = urlParser.parse(url)
        let i = 0

        for (const link of links.filter(link => link.includes(host))) {
            if (!newUrls.some((website) => link.toLowerCase().includes(website.toLowerCase()))) {
                console.log(`Old Link: ${link} found on URL ${url}`);
                foundOldLinks[url] = foundOldLinks[url] ? [...foundOldLinks[url], link] : [link]
            }
            i++
            if (i === links.filter(link => link.includes(host)).length) {
                pageFinished = true
                console.log(`PAGE FINISHED ${url}`)
            }
            if (link.includes(newUrls[0]) && !seenUrls[getUrl(link)]) {
                await crawl(getUrl(link))
            }
        }
    }

    const crawlAll = async () => {
         return await crawl(url).then(() => {
            console.log('CRAWL FINISHED')
            return Object.entries(foundOldLinks).map(([key,value]) => ({url: key, links: value}))
        })
    }

    const result = await crawlAll()
    console.log(result)
    res.status(200).json({ foundOldLinks: result })
})

app.post("/api/v1/findTarget", async (req, res) => {
  const url = req.body.searchUrl

    const targetUrls = req.body.targetUrls

    const getUrl = (link) => {
    if (link.includes('http')) {
        return link
    } else if (link.startsWith('/')) {
        // console.log(`SHOURTCUT ${link}` )
         console.log(`${url}/${link}`);
        return `${url}/${link}`
    } else {
        return `${url}/${link}`
    }
}

const seenUrls = {}
const foundTargetLinks = {}
let crawlCount = 0
    const crawl = async (url) => {
    console.log(`Crawling ${url}`)
    seenUrls[url] = true
    crawlCount ++
    const res = await fetch(url)
    const html = await res.text()
    const $ = cheerio.load(html)
    const links = $("a").map((i, link) => link.attribs.href).get()
    const { host } = urlParser.parse(url) 
    
    for (const link of links.filter(link => getUrl(link).includes(host))) {
        if (targetUrls.some((website) => link.toLowerCase().includes(website.toLowerCase()))) {
            console.log(`Found Link: ${link} found on URL ${url}`);
            foundTargetLinks[url] = foundTargetLinks[url] ? [...foundTargetLinks[url], link] : [link]
        }
        if (getUrl(link).includes(url) && !seenUrls[getUrl(link)]) {
            await crawl(getUrl(link))
        }
    }
}

    const crawlAll = async () => {
         return await crawl(url).then(() => {
            console.log('CRAWL FINISHED')
            return Object.entries(foundTargetLinks).map(([key, value]) => ({ url: key, links: value }));
        })
    }

    const result = await crawlAll()
    console.log(result)
    res.status(200).json(result)
})
app.post("/api/v1/bannedSubdomains", async (req, res) => {
  const url = req.body.newUrl

    const subdomains = req.body.subdomains

const getUrl = (link) => {
    if (link.includes('http')) {
        return link
    } else if (link.startsWith('/')) {
        console.log(`${url}/${link}`);
        return `${url}/${link}`
    } else {
        return `${url}/${link}`
    }
}

const seenUrls = {}
const foundTargetLinks = {}
let crawlCount = 0
const crawl = async (url) => {
    seenUrls[url] = true
    crawlCount ++
    const res = await fetch(url)
    const html = await res.text()
    const $ = cheerio.load(html)
    const links = $("a").map((i, link) => link.attribs.href).get()
    const { host } = urlParser.parse(url)
    
    for (const link of links.filter(link => link.includes(host))) {
        if (subdomains.some((website) => link.toLowerCase().includes(`${host.toLowerCase()}${website.toLowerCase()}`))) {
            console.log(`Found Link: ${link} found on URL ${url}`);
            foundTargetLinks[url] = foundTargetLinks[url] ? [...foundTargetLinks[url], link] : [link]
        }
        if (getUrl(link).includes(url) && !seenUrls[getUrl(link)]) {
            await crawl(getUrl(link))
        }
    }
    }
    

    const crawlAll = async () => {
         return await crawl(url).then(() => {
            console.log('CRAWL FINISHED')
            return Object.entries(foundTargetLinks).map(([key,value]) => ({url: key, links: value}))
        })
    }

    const result = await crawlAll()
    res.status(200).json(result)
})

module.exports = app;
