// Content logic
// doc api : https://pptr.dev/#?product=Puppeteer&version=v13.5.2&show=outline
const puppeteer = require("puppeteer"); // npm i puppeteer 
const tools = require('./tools')

/* Uses: 
    - Get page size
    - Get numbers of request 
*/ 
// read : https://deviceatlas.com/blog/measuring-page-weight
// also https://www.checklyhq.com/learn/headless/request-interception/
module.exports.getPageMetrics = async (url,callback)=>{
    const browser = await puppeteer.launch(); // add in launch : { headless: false } => show browser 
    const page = await browser.newPage();
    const gitMetrics = await page.metrics();

    // Use to do more things with the requests made by the website (check the doc)
    await page.setRequestInterception(true);

    var measures = {
        "size":0,
        "nbRequest": 0,
        "domSize":0,
        "loadTime": gitMetrics.TaskDuration,
        "filesNotMin": []
    }

    page.on('request',(response)=>{
        response.continue();
    })

    page.on('response', async (response) => {
        measures.nbRequest+=1

        if(!response.ok) response.continue();

        // We only want non-data requests 
        if (!response.url().startsWith('data:')) {
            response.buffer().then(
                buffer => {
                    measures.size+=buffer.length
                },
                error => {
                  console.error(`${response.status()} ${response.url()} Erreur: ${error}`);
                }
            );
        }

        // For more info : https://stackoverflow.com/questions/57524945/how-to-intercept-a-download-request-on-puppeteer-and-read-the-file-being-interce
        if(await response.url().includes('.js') || await response.url().includes('.css')){
            const content = await response.text();
            const totalSize = await content.length;
            const result = await tools.isMinified(content);
            const poid = await (await response.buffer()).length;
            
            if(!result){
                measures.filesNotMin.push(response.url())
                //console.log(`${response.url()} \t taille : ${totalSize} , poid : ${poid} \t => Contenu non minimiser `)
            }

        }

    })

    await page.goto(url,{waitUntil:('domcontentloaded' && 'networkidle0')});

    measures.domSize = await page.$$eval('*',array => array.length);

    const hrefs = await page.evaluate(
        () => Array.from(
          document.querySelectorAll('a[href]'),
          a => a.getAttribute('etags')
        )
    );

    console.log("Href : " , hrefs)

    await page.close();
    await browser.close();

    callback(measures,true);
}

