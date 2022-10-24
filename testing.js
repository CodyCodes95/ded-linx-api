const fetch = require("node-fetch");
const cheerio = require("cheerio");

fetch("https://www.reinsw.com.au/Web/Web/News/News_Search.aspx?hkey=0f6faa0a-4420-41dc-878d-71b945c06cec").then(res => res.text().then((text) => {
   const $ = cheerio.load(text)
    const links = $("a").map((i, link) => link.attribs.href).get()
    console.log(links)
}))