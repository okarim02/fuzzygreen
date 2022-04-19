// Content logic
// doc api : https://pptr.dev/#?product=Puppeteer&version=v13.5.2&show=outline
const puppeteer = require("puppeteer"); // npm i puppeteer 
const common = require('./common')

/* Uses: 
    - Get page size
    - Get numbers of request 
*/ 
// read : https://deviceatlas.com/blog/measuring-page-weight
// also https://www.checklyhq.com/learn/headless/request-interception/
module.exports.getPageMetrics = async (url,callback)=>{
    const browser = await puppeteer.launch(); // add in launch { headless: false } => show browser 
    const page = await browser.newPage();
    await page.setRequestInterception(true)

    var measures = {
        "size":0,
        "nbRequest": 0,
        "domSize":0
    }

    await page.on('request', (request) => {
        measures.nbRequest+=1
        request.continue()
    })

    await page.on('response', (response) => {
        // We only want non-data requests 
        measures.nbRequest+=1
        if (!response.url().startsWith('data:') && response.ok) {
            response.buffer().then(
                buffer => {
                    measures.size+=buffer.length
                },
                error => {
                  console.error(`${response.status()} ${response.url()} Erreur: ${error}`);
                }
            );
        }
    })

    await page.goto(url,{waitUntil:'domcontentloaded'});

    measures.domSize = await page.$$eval('*',array => array.length);

    await page.close();
    await browser.close();

    callback(measures,true);
}

