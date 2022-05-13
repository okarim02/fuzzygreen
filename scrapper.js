// Content logic
// @see doc api : {@link https://pptr.dev/#?product=Puppeteer&version=v13.5.2&show=outline}
const puppeteer = require("puppeteer"); // npm i puppeteer 
const common = require("./common");
const tools = require('./tools');

/*
 * read : https://deviceatlas.com/blog/measuring-page-weight
 * also https://www.checklyhq.com/learn/headless/request-interception/
*/

var measures = {
    'size': 0,
    'nbRequest': 0,
    'domSize': 0,
    'filesNotMin': [],
    'policesUtilise': [],
    'etagsNb': 0,
    'imagesWithoutLazyLoading': [],
    'cssFiles': 0,
    'cssOrJsNotExt': 0,
    'filesWithError': [],
    'socialButtonsFound': [],
    'isStatic': false,
    'poweredBy': [],
    'protocolHTTP': '',
    'cms': [],
    'loadTime': 0,
    'ratioLazyLoad': '2.0408163265306123%',
    'ratioimagesResizedInPage': 0,
    'ratioHttp1': 0,
    'plugins': 'aucun plugin détecté',
    'host': { isGreen: false, energy: '' },
    'ecoIndex': '',
    'isMobileFriendly':false
}

function setMeasurestoDo(){
    console.log("Common crit : ",common.criteres_toNotCount);
    if(common.criteres_toNotCount.length==0) return;
    for(let i of measures){
        if(common.criteres_toNotCount.includes(i)){
            delete measures[i];
        }
    }
    console.log("New measures :",measures);
}

module.exports.getPageMetrics = async (url, page, callback) => {
    setMeasurestoDo();
    //'use strict';
    
    // Todo : continue with the criteria

    /*
    // @see cluster file
    var browser = await puppeteer.launch({
        devtools: true,
        headless: true,
        ignoreHTTPSErrors: true
    }); 
    const page = await browser.newPage();
    */

    const gitMetrics = await page.metrics();

    // Use to do more things with the requests made by the website (check the doc)
    await page.setRequestInterception(true);

    // var & const
    var counter_http1 = 0;

    page.on('request', (request) => {
        request.continue();
    });
    // listen for the server's responses
    page.on('response', async (response) => {
        measures.nbRequest += 1

        if (response.url().startsWith("http:")) {
            counter_http1 += 1;
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
                //if ((poidImage / 1048576.0) > 10) {

                if ((poidImage) > 10) {
                    //console.log("l'Image ci-dessus est trop grande ! ")
                }
            }
        }



        // For more info : https://stackoverflow.com/questions/57524945/how-to-intercept-a-download-request-on-puppeteer-and-read-the-file-being-interce
        if (response.url().endsWith('.js') || response.url().endsWith('.css')) {
            const content = await response.text();
            const totalSize = await content.length;
            const isMin = await tools.isMinified(content);

            const poid = await (await response.buffer()).length;

            if (await response.url().endsWith('.js')) {
                // check syntax
                const resultCheck = await tools.checkSyntax(content);
                if (resultCheck != "") {
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

    const url_object = new URL(url);
    measures.protocolHTTP = url_object.protocol; // http2 => good | http1 => bad 

    // GO TO THE PAGE 
    await page.goto(url, { waitUntil: ('networkidle0') });

    measures.cms = await getCMS(page, browser = undefined).then(e => e ? e : []);

    measures.isStatic = await isStatic(page);
    measures.loadTime = await getLoadTime(page);

    /* Todo : utiliser la méthode ci-dessous pour trouver le protocole utilisé.
    * Goal : Get the protocol using for each request/response
    * @see {@link https://jsoverson.medium.com/using-chrome-devtools-protocol-with-puppeteer-737a1300bac0}
    * Create a cdp session, for chrome devtool 
    */
    const client = await page.target().createCDPSession();

    const isNotExt = await countNumberOfInlineStyleSheet(page);
    measures.cssOrJsNotExt += isNotExt;

    const res = await getRatioLazyImages(page);

    measures.cssFiles = await page.evaluate(() => {
        return document.styleSheets.length;
    });
    measures.ratioLazyLoad = res.ratio;

    measures.imagesWithoutLazyLoading = res.imagesNoLazy;

    measures.ratioimagesResizedInPage = await getImagesResized(page).then(e => e.ratio);

    measures.ratioHttp1 = await (counter_http1 / measures.nbRequest) * 100;

    measures.domSize = await page.$$eval('*', array => array.length);

    measures.plugins = await getPlugins(page).then(e => e ? e.length : 0);
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
    //await browser.close();

    callback(measures, true);
}

async function getRobot(br, url) {
    const robot = await br.newPage();
    await robot.goto(url + "robots.txt");
    const content = await robot.content();
    console.log(robot.url());
    console.log("robot:", content)
    robot.close();
    return content;
}

async function getLoadTime(page) {
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
    if (measures.poweredBy.length != 0) { // rule 3.
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

    const timeTook = await getLoadTime(page);

    console.log(`Temps écoulé : ${timeTook}ms ${timeTook > 1000 ? `soit ${timeTook / 1000}s` : ""}`);
    if (timeTook / 1000 > 2) {
        return false;
    }

    return true;
}
/*
    * @see {@link https://serpstat.com/blog/how-to-detect-which-cms-a-website-is-using-8-easy-ways/#:~:text=The%20name%20of%20the%20CMS,source%20code%20of%20the%20page&text=Go%20to%20the%20website%20you%20want%20to%20examine.&text=Press%20Ctrl%20%2B%20U%20to%20display%20the%20page%20code.&text=Find%20the%20tag%20with%20the,content%3D%20on%20the%20html%20page.}
    todo : A continuer
*/
async function getCMS(page, browser) {
    const cms_library = {
        "wordpress": "wp"
    }
    let cms = await page.evaluate(() => {
        var cms = [];

        const meta = document.head.querySelector('head > meta[name="generator"]');

        if (meta != undefined) {
            cms.push(meta.getAttribute("content"));
        }

        const srcs = document.head.querySelectorAll('head > script[type="text/javascript"]')
        if (srcs.length > 0) {
            for (let i of srcs) {
                const s = i.src;
                if (s.includes("wp-includes") || s.includes("wp-content") || s.includes("wp-emoji")) {
                    if (!cms.includes("wordpress")) {
                        cms.push("wordpress");
                    }
                    break;
                }
            }
        }

        var refs = document.head.querySelectorAll('head > link[rel="stylesheet"]');
        if (refs.length > 0) {
            for (let i of refs) {
                const s = i.href;
                if (s.includes("wp-includes") || s.includes("wp-content") || s.includes("wp-emoji")) {
                    if (!cms.includes("wordpress")) {
                        cms.push("wordpress");
                    }
                    break;
                }
            }
        }


        return cms;
    })
    /*
    // fix this
    const txt = await getRobot(browser,page.url());
    console.log("TXT : ",txt);
    if(txt.contains("wp") && cms.includes("wordpress")){
        cms.push("wordpress");
    }*/

    return cms;
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