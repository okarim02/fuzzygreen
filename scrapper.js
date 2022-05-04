// Content logic
// doc api : https://pptr.dev/#?product=Puppeteer&version=v13.5.2&show=outline
const puppeteer = require("puppeteer"); // npm i puppeteer 
const tools = require('./tools');

/* Uses: 
    - Get page size
    - Get numbers of request 
*/
// read : https://deviceatlas.com/blog/measuring-page-weight
// also https://www.checklyhq.com/learn/headless/request-interception/

var measures = {
    "size": 0,
    "nbRequest": 0,
    "domSize": 0,
    "JSHeapUsedSize": 0,
    "filesNotMin": [],
    "policesUtilise": [],
    "etagsNb": 0,
    "imagesWithoutLazyLoading": 0,
    "cssFiles": 0,
    "cssOrJsNotExt": 0,
    "filesWithError": [],
    "socialButtonsFound": [],
    "nbOfImagesWithSrcEmpty": 0,
    "isStatic": 0, // a static webpage give the same content for each user, its hard to identify them but we can check some factors 
    "poweredBy": [],
}

module.exports.getPageMetrics = async (url, callback) => {
    const browser = await puppeteer.launch({
        devtools: true,
        headless: true,
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    const gitMetrics = await page.metrics();

    // Use to do more things with the requests made by the website (check the doc)
    await page.setRequestInterception(true);

    // var & const
    var counter_http1 = 0 ;
    var counter_http2 = 0 ;

    var measures = {
        "size": 0,
        "nbRequest": 0,
        "domSize": 0,
        "loadTime": 0,
        "JSHeapUsedSize": gitMetrics.JSHeapUsedSize,
        "filesNotMin": [],
        "policesUtilise": [],
        "etagsNb": 0,
        "imagesWithoutLazyLoading": 0,
        "cssFiles": 0,
        "cssOrJsNotExt": 0,
        "ratioHttp1":0,
    }

    page.on('request', (request) => {
        request.continue();
    });
    // listen for the server's responses
    page.on('response', async (response) => {
        measures.nbRequest += 1

        if(response.url().startsWith("http:")){
            counter_http1+=1;
        }else{
            counter_http2+=1;
        }

        if (!response.ok) response.continue();

        if (response.url() == url) { // Its the html document
            let poweredBy = response.headers()['x-powered-by'];
            if (poweredBy != undefined) {
                poweredBy = poweredBy.split('\n');
                measures.poweredBy = poweredBy;
            }
        }

        // We only want non-data requests 
        if (!response.url().startsWith('data:')) {
            const btSocial = await tools.checkIfSocialButton(response.url())
            if (btSocial != "") {
                measures.socialButtonsFind.push(response.url());
            }
            response.buffer().then(
                buffer => {
                    measures.size += buffer.length
                },
                error => {
                    console.error(`${response.status()} ${response.url()} Erreur: ${error}`);
                }
            );

            if (response.headers().hasOwnProperty('etag')) {
                measures.etagsNb += 1
            }

            // https://stackoverflow.com/questions/43617227/check-size-of-uploaded-file-in-mb
            if (response.request().resourceType() === 'image') {
                const poidImage = response.headers()['content-length']
                //console.log(`IMAGE ${response.url()} , poid : ${ poidImage }`)
                if ((poidImage / 1048576.0) > 10) {
                    console.log("l'Image ci-dessus est trop grande ! ")
                }
            }
        }



        // For more info : https://stackoverflow.com/questions/57524945/how-to-intercept-a-download-request-on-puppeteer-and-read-the-file-being-interce
        if (response.url().includes('.js') || response.url().includes('.css')) {
            const content = await response.text();
            const totalSize = await content.length;
            const isMin = await tools.isMinified(content);

            const poid = await (await response.buffer()).length;

            if (await response.url().includes('.js')) {
                // check syntax
                const resultCheck = await tools.checkSyntax(content);
                if (resultCheck != "") {
                    console.log(resultCheck);
                    measures.filesWithError.push(response.url());
                }
                // Check if there is sql inside a loop
                // todo 
                // const result = await tools.hasLoopInsideSql(content);
            }

            if (!isMin) {
                measures.filesNotMin.push(response.url())
                //console.log(`${response.url()} \t taille : ${totalSize} , poid : ${poid} \t => Contenu non minimiser `)
            }
        }

        if (response.request().resourceType() == "font") {
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


    // GO TO THE PAGE 
    await page.goto(url, { waitUntil: ('networkidle0') });

    measures.isStatic = await isStatic(page);
    measures.loadTime = await getLoadTime(page);

    // Todo : utiliser la méthode ci-dessous pour trouver le protocole utilisé.
    // Goal : Get the protocol using for each request/response
    // https://jsoverson.medium.com/using-chrome-devtools-protocol-with-puppeteer-737a1300bac0
    // Create a cdp session, for chrome devtool 
    //const client = await page.target().createCDPSession();

    const isNotExt = await countNumberOfInlineStyleSheet(page);
    measures.cssOrJsNotExt += isNotExt;

    const res = await getRatioLazyImages(page);

    measures.cssFiles = await page.evaluate(() => {
        return document.styleSheets.length;
    });
    measures.ratioLazyLoad = res.ratio;

    measures.imagesWithoutLazyLoading = res.imagesNoLazy;


    measures.ratioimagesResizedInPage = await getImagesResized(page).then(e => e.ratio);
    
    measures.ratioHttp1 = await (counter_http1/measures.nbRequest)*100;

    measures.domSize = await page.$$eval('*', array => array.length);
    /*
     const pdfs = await getAllpdf(page);
     // check if a pdf's size is higher than normal
     for(var i= 0 ; i < pdfs.length ;i++){
         const el = pdfs[i];
         const href = await page.evaluate(e => e.href,el);
         const poid = await getPDFsize(href,browser);
         if(poid > 1024){
             measures.heavyPdf.push(href);
         }
     }
     */

    await page.close();
    await browser.close();

    callback(measures, true);
}

async function getLoadTime(page){
    const perf = await page.evaluate(_ => {
        const { loadEventEnd, navigationStart } = performance.timing
        return ({
            loadTime: loadEventEnd - navigationStart
        })
    })
    return perf.loadTime;
}

async function isStatic(page) {

    /*
           1. Check if URLs end with .html, .htm, .shtml and doesn't contain '?'.
           2. Static websites rarely set cookies/sessions.
           3. Static webpage use HTML,JS and CSS contrary to a dynamic page who use php,cgi,ajax,asp,asp.net ...  
           4. Can we login ? If yes then its not a static page because he don't use database.

           => This function is not 100% true, a dynamic webpage may use the same tools as static page so don't 

           More info : https://iconicdigitalworld.com/how-to-check-if-a-website-is-dynamic-or-or-static/#:~:text=To%20find%20out%20how%20to,JSP%2C%20the%20page%20is%20dynamic.
       */
    if (measures.poweredBy.length!=0) { // rule 3.
        return false;
    }
    const url = page.url();

    if (url.includes('?')) { // 1.
        return false;
    }

    const staticUrls = [".html", ".htm", ".shtml"]

    for (let i = 0; i < staticUrls.length; i++) {
        if (url.endsWith(staticUrls[i])) {
            return true;
        }
    }
    // A static webpage take a few milliseconds to responds contrary to a dynamic webpage because he make some request to a database before loading fully.
    

    const timeTook = getLoadTime(page);

    console.log(`Temps écoulé : ${timeTook}ms ${timeTook > 1000 ? `soit ${timeTook / 1000}s` : ""}`);
    if (timeTook / 1000 > 2) {
        return false;
    }

}

async function getAllpdf(page) {
    const a_elements = await page.$$('a');
    var pdfs = [];
    for (var i = 0; i < a_elements.length; i++) {
        const el = a_elements[i];
        const href = await page.evaluate(e => e.href, el);

        if (href.endsWith('.pdf')) {
            pdfs.push(a_elements[i]);
            console.log("PDF : ", href);
        }
    }
    return pdfs;
}
// If a html stylesheet doesn't have a href that mean he was not written in a specific file but directly in the html 
async function countNumberOfInlineStyleSheet(page) {
    const result = await page.evaluate(() => {
        let stylesheets = document.styleSheets;
        var count = 0;
        for (let i of stylesheets) {
            if (!i.href) {
                count += 1;
            }
        }
        return count;
    })

    return result;

}

async function getImagesResized(page) {

    const res = await page.evaluate(() => {
        let imgs = document.querySelectorAll('img');
        var data = [];
        for (let i = 0; i < imgs.length; i++) {
            const img = imgs[i];
            if (img.clientWidth < img.naturalWidth || img.clientHeight < img.naturalHeight) {
                // Images of one pixel are some times used ... , we exclude them
                const isVisible = (img.clientWidth != 0);
                const isASvg = img.src.includes(".svg?") || img.src.endsWith(".svg");
                if (isVisible && img.naturalWidth > 1 && !isASvg) {
                    data.push(img.src);
                }
            }
        }
        return { "imagesResized": data, "ratio": data.length / imgs.length * 100 };
    });

    return res;
}

async function getRatioLazyImages(page) {

    const result = await page.evaluate(() => {
        let imgs = document.querySelectorAll('img');
        let totalImages = imgs.length;
        let lazyImages = 0;
        let notLazy = [];
        for (let img of imgs) {
            const attr = img.getAttribute("loading");
            if (attr != null) {
                lazyImages += 1;
            } else {
                notLazy.push(img.src);
            }
        }

        return { totalImages, lazyImages, notLazy };
    })

    const ratio = ((result.lazyImages / result.totalImages) * 100);
    const imagesNoLazy = result.notLazy;
    return { ratio, imagesNoLazy };
}
async function getPlugins(page) {
    const plugins = page.evaluate(() => {
        return Navigator.plugins;
    })
    return plugins;
}