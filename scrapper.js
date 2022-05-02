// Content logic
// doc api : https://pptr.dev/#?product=Puppeteer&version=v13.5.2&show=outline
const { response } = require("express");
const puppeteer = require("puppeteer"); // npm i puppeteer 
const tools = require('./tools');

/* Uses: 
    - Get page size
    - Get numbers of request 
*/ 
// read : https://deviceatlas.com/blog/measuring-page-weight
// also https://www.checklyhq.com/learn/headless/request-interception/
module.exports.getPageMetrics = async (url,callback)=>{
    const browser = await puppeteer.launch({
        devtools: true,
        headless: true,
        ignoreHTTPSErrors : true
    });
    const page = await browser.newPage();
    const gitMetrics = await page.metrics();

    // Use to do more things with the requests made by the website (check the doc)
    await page.setRequestInterception(true);

    var measures = {
        "size":0,
        "nbRequest": 0,
        "domSize":0,
        "loadTime": gitMetrics.TaskDuration,
        "JSHeapUsedSize":gitMetrics.JSHeapUsedSize,
        "filesNotMin": [],
        "policesUtilise":[],
        "etagsNb":0,
        "imagesWithoutLazyLoading":0,
        "cssFiles":0,
        "cssOrJsNotExt":0,
        "filesWithError":[],
        "socialButtonsFound":[],
        "nbOfImagesWithSrcEmpty":0
    }

    page.on('request',(request)=>{
        request.continue();
    });

    page.on('response', async (response) => {
        measures.nbRequest+=1

        if(!response.ok) response.continue();

        // We only want non-data requests 
        if (!response.url().startsWith('data:')) {
            const btSocial = await tools.checkIfSocialButton(response.url())
            if( btSocial != ""){
                measures.socialButtonsFind.push(response.url());
            }
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
        if(response.url().includes('.js') || response.url().includes('.css')){
            const content = await response.text();
            const totalSize = await content.length;
            const isMin = await tools.isMinified(content);

            const poid = await (await response.buffer()).length;

            if(await response.url().includes('.js')){
                // check syntax
                console.log("Fichier testé : ", response.url());
                const resultCheck = await tools.checkSyntax(content);
                if(resultCheck!=""){
                    console.log(resultCheck);
                    measures.filesWithError.push(response.url());
                }
                // Check if there is sql inside a loop
                // todo 
                // const result = await tools.hasLoopInsideSql(content);
            }
            
            if(!isMin){
                measures.filesNotMin.push(response.url())
                //console.log(`${response.url()} \t taille : ${totalSize} , poid : ${poid} \t => Contenu non minimiser `)
            }

        }
        
        if( response.request().resourceType() == "font"){
            measures.policesUtilise.push(response.url());
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
    measures.protocolHTTP = url_object.protocol; // http2 => good | http1 => bad 

    await page.goto(url,{waitUntil:('networkidle0')});
    // Todo : utiliser la méthode ci-dessous pour trouver le protocole utilisé.
    // Goal : Get the protocol using for each request/response
    // https://jsoverson.medium.com/using-chrome-devtools-protocol-with-puppeteer-737a1300bac0
    // Create a cdp session, for chrome devtool 
    //const client = await page.target().createCDPSession();

    const isNotExt = await countNumberOfInlineStyleSheet(page);
    measures.cssOrJsNotExt += isNotExt;

    const res = await getRatioLazyImages(page);

    measures.cssFiles = await page.evaluate(()=>{
        return document.styleSheets.length;
    });
    measures.ratioLazyLoad = res.ratio;
    measures.imagesWithoutLazyLoading = res.imagesNoLazy;

    const res2 = await getImagesResized(page);
    measures.imagesResizedInPage = `${res2.ratio} (${res2.imgsResized.length} images redimensionné)`;

    measures.domSize = await page.$$eval('*',array => array.length);

    measures.nbOfImagesWithSrcEmpty = await page.evaluate(()=>{
        let imgs = document.getElementsByTagName('img');
        let cpt = 0;
        for (let img of imgs){
            const attr = img.getAttribute("src");
            if(attr==""){
                cpt+=1;
            }
        }
        return cpt;
    })
    
    const pdfs = await getAllpdf(page); // todo

    await page.close();
    await browser.close();

    callback(measures,true);
}

async function getAllpdf(page){
    const a_elements = await page.$$('a');
    var pdfs = [];
    for(var i = 0 ; i < a_elements.length;i++){
        const el = a_elements[i];
        const href = await page.evaluate(e => e.href,el);

        if(href.endsWith('.pdf')){
            pdfs.push(a_elements[i]);
            console.log("PDF : ",href);
        }
    }
    return pdfs;
}
// If a html stylesheet doesn't have a href that mean he was not written in a specific file but directly in the html 
async function countNumberOfInlineStyleSheet(page){
    const result =await page.evaluate(()=>{
        let stylesheets = document.styleSheets;
        var count = 0;
        for (let i of stylesheets){
            if(!i.href){
                count+=1;
            }
        }
        return count;
    })

    return result;
    
}

async function getImagesResized(page){
    const result = await page.evaluate(()=>{
        let imgs = document.querySelectorAll('img');
        let totalImages = imgs.length;
        let imgsResized = [];
        for (let img of imgs){
            const attr1 = img.getAttribute("width");
            const attr2 = img.getAttribute("height");

            if(attr1 !=null || attr2 != null){
                imgsResized.push(img)
            }
        }
        return {totalImages,imgsResized};
    })
    
    const ratio = ((result.imgsResized.length/result.totalImages) * 100);
    const imgsResized = result.imgsResized;
    return {ratio,imgsResized};
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