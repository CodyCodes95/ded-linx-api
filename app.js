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
  res.send({ string: postcodeString.slice(0, postcodeString.length - 1) });
});
app.post("/api/v1/findTarget", async (req, res) => {
  res.send({ string: postcodeString.slice(0, postcodeString.length - 1) });
});
app.post("/api/v1/bannedSubdomains", async (req, res) => {
  const url = req.body.newUrl

    const subdomains = req.body.subdomains

const getUrl = (link) => {
    if (link.includes('http')) {
        return link
    } else if (link.startsWith('/')) {
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
        if (link.includes(url) && !seenUrls[getUrl(link)]) {
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
});

module.exports = app;
