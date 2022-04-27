// Content logic
// doc api : https://pptr.dev/#?product=Puppeteer&version=v13.5.2&show=outline
const puppeteer = require("puppeteer"); // npm i puppeteer 
const tools = require('./tools');
const fetch = (...args) => import('node-fetch')
              .then(({default: fetch}) => fetch(...args));

require("dotenv").config();

/* Uses: 
    - Get page size
    - Get numbers of request 
*/ 
// read : https://deviceatlas.com/blog/measuring-page-weight
// also https://www.checklyhq.com/learn/headless/request-interception/
module.exports.getPageMetrics = async (url,callback)=>{
    const browser = await puppeteer.launch(
        ignoreHTTPSErrors = true
    ); // add in launch : { headless: false } => show browser 
    const page = await browser.newPage();
    const gitMetrics = await page.metrics();

    // Use to do more things with the requests made by the website (check the doc)
    await page.setRequestInterception(true);

    var measures = {
        "size":0,
        "nbRequest": 0,
        "domSize":0,
        "loadTime": gitMetrics.TaskDuration,
        "filesNotMin": [],
        "policesUtilise":[],
        "etagsNb":0,
        "imagesWithoutLazyLoading":0,
        "cssFiles":0
    }

    measures.isMobileFriendly = await isMobileFriendly(url);

    page.on('request',(response)=>{
        response.continue();
    });

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

        if(response.headers().hasOwnProperty('etag')){
            measures.etagsNb+=1
        }

        // https://stackoverflow.com/questions/43617227/check-size-of-uploaded-file-in-mb
        if(response.request().resourceType()==='image'){
            const poidImage = response.headers()['content-length']
            //console.log(`IMAGE ${response.url()} , poid : ${ poidImage }`)
            if((poidImage / 1048576.0)>10){
                console.log("l'Image ci-dessus est trop grande ! ")
            }
        }

        // For more info : https://stackoverflow.com/questions/57524945/how-to-intercept-a-download-request-on-puppeteer-and-read-the-file-being-interce
        if(await response.url().includes('.js') || await response.url().includes('.css')){
            const content = await response.text();
            if(await response.url().includes('.js')){
                // Check if there is sql inside a loop
                // todo 
                // const result = await tools.hasLoopInsideSql(content);
            }
            const totalSize = await content.length;
            const result = await tools.isMinified(content);
            const poid = await (await response.buffer()).length;
            
            if(!result){
                measures.filesNotMin.push(response.url())
                //console.log(`${response.url()} \t taille : ${totalSize} , poid : ${poid} \t => Contenu non minimiser `)
            }
        }

        if( response.request().resourceType() == "font"){
            measures.policesUtilise.push(response.url());
        }

        if(response.request().resourceType() == "stylesheet"){
            measures.cssFiles+=1;
        }
        

    })
    // Obtenir le protocol http 
    // Sol 1 marche pas ...
    // https://stackoverflow.com/questions/57196373/how-to-get-the-http-protocol-version-in-puppeteer
    /*
    const httpVersion = await page.evaluate(() => performance.getEntries()[0].nextHopProtocol);
    console.log(httpVersion)
    measures.protocolHTTP = httpVersion;
    */
    // sol 2
    // https://developer.mozilla.org/en-US/docs/Web/API/URL
    const url_object = new URL(url);
    measures.protocolHTTP = url_object.protocol;

    await page.goto(url,{waitUntil:('networkidle0')});
    
    const res = await getRatioLazyImages(page);

    measures.ratioLazyLoad = res.ratio;
    measures.imagesWithoutLazyLoading = res.imagesNoLazy;


    measures.domSize = await page.$$eval('*',array => array.length);
    
    await page.close();
    await browser.close();

    callback(measures,true);
}

// todo : A terminer ...
// https://developers.google.com/webmaster-tools/search-console-api/reference/rest/v1/urlTestingTools.mobileFriendlyTest/run
async function isMobileFriendly(urlTo){
    var params = {
        'url': urlTo,
        'requestScreenshot': false,
        'key':process.env.MOBILE_FRIENDLY_API
    }
    console.log("KEY:",process.env.MOBILE_FRIENDLY_API);

    const data = await fetch('https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run', 
        {
            method: 'POST',
            body: JSON.stringify(params),
            headers: { 'Content-Type': 'application/json' }
        }
    ).then(res => res.json());

    console.log(data);
}

async function getRatioLazyImages(page){
    
    const result = await page.evaluate(()=>{
        let imgs = document.querySelectorAll('img');
        let totalImages = imgs.length;
        let lazyImages = 0;
        let notLazy = [];
        for (let img of imgs){
            const attr = img.getAttribute("loading");
            if(attr!=null){
                lazyImages+=1;
            }else{
                notLazy.push(img.src);
            }
        }

        return {totalImages,lazyImages,notLazy};
    })
    
    const ratio = ((result.lazyImages/result.totalImages) * 100);
    const imagesNoLazy = result.notLazy;
    return {ratio,imagesNoLazy};
}