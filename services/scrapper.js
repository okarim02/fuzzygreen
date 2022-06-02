// Content logic
// @see doc api : {@link https://pptr.dev/#?product=Puppeteer&version=v13.5.2&show=outline}
const puppeteer = require("puppeteer"); // npm i puppeteer 
const common = require("./common");
const tools = require('./tools');

/*
 * read : https://deviceatlas.com/blog/measuring-page-weight
 * also https://www.checklyhq.com/learn/headless/request-interception/
*/

function Measures(){
    return {
        'PageSize(Ko)': 0, // Serveur
        'RequestsNb': 0,
        'DOMsize(nb elem)': 0,
        //'filesNotMin': [],
        'JSMinification':[],
        'CSSMinification':[],
        'CSSNotExt':0,
        'JSNotExt':0,
        'etagsRatio':0.0,
        'etagsNb': 0,
        'filesWithError': [],
        'isStatic': 1,
        'pluginsNb': 0,
        'Http1.1/Http2requests': 0,
        'FontsNb': [], // design
        'imagesWithoutLazyLoading': [],
        'lazyLoadRatio': 0,
        'cssFiles': 0,
        //'cssOrJsNotExt': 0,
        'socialButtons': [],
        'CMS': [],
        //'loadTime(ms)': 0, // A supprimer
        'imgResize': 0,
        'isMobileFriendly':false,
        "imgSrcEmpty":0,
        "host":{} // hosting
    }
}

function setMeasurestoDo(criteres_selected){
    let m = Measures(); 
    if(criteres_selected.length==0) return m;
    for(let i in m){
        if(!criteres_selected.includes(i)){
            delete m[i];
        }
    }
    return m;
}

module.exports.getPageMetrics = async (url, page,criteres_selected, callback) => {
    var measures = setMeasurestoDo(criteres_selected);
    //'use strict';

    // Take screenshot 
    await page.screenshot({ path: `page.jpeg` });

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
        measures.RequestsNb += 1

        if (response.url().startsWith("http:")) {
            counter_http1 += 1;
        }

        if (!response.ok) response.continue();

        if (response.url() == url) { // Its the html document
            let poweredBy = response.headers()['x-powered-by'];
            if (poweredBy != undefined) {
                poweredBy = poweredBy.split('\n');
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
                    measures['PageSize(Ko)'] += buffer.length
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

            // For more info : https://stackoverflow.com/questions/57524945/how-to-intercept-a-download-request-on-puppeteer-and-read-the-file-being-interce
            if (response.request().resourceType() == "script" || response.request().resourceType() == "stylesheet") {
                const content = await response.text();
                const totalSize = await content.length;
                const isMin = await tools.isMinified(content);
                const poid = await (await response.buffer()).length;

                if (await response.request().resourceType() == "script") {
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
                    if(response.request().resourceType()=="script"){
                        if(!measures.JSMinification.includes(response.url()) && response.url() != ""){
                            measures.JSMinification.push(response.url());
                        }
                    }else{
                        if(!measures.CSSMinification.includes(response.url)){
                            measures.CSSMinification.push(response.url());
                        }
                    }
                }
            }
        
        }

        if (response.request().resourceType() == "font") {
            measures.FontsNb.push(response.url());
        }
    })

    const url_object = new URL(url);

    // GO TO THE PAGE 
    await page.goto(url, { waitUntil: ('networkidle0') });

    measures.CMS = await getCMS(page, browser = undefined).then(e => e ? e : []);

    measures.isStatic = await isStatic(page,measures) ? 1 : 0;
    //measures['loadTime(ms)'] = await getLoadTime(page);

    /* Todo : utiliser la méthode ci-dessous pour trouver le protocole utilisé.
    * Goal : Get the protocol using for each request/response
    * @see {@link https://jsoverson.medium.com/using-chrome-devtools-protocol-with-puppeteer-737a1300bac0}
    * Create a cdp session, for chrome devtool 
    */
    const client = await page.target().createCDPSession();

    // Critères id: 15 et 16 .
    await countNumberOfInlineStyleSheet(page).then((jsNotExt,cssNotExt)=>{
        measures.JSNotExt = jsNotExt;
        measures.CSSNotExt = cssNotExt;
    });

    const res = await getRatioLazyImages(page);

    measures.cssFiles = await page.evaluate(() => {
        return document.styleSheets.length;
    });

    measures.etagsRatio = measures.etagsNb / measures.RequestsNb;
    measures.etagsRatio = parseFloat(measures.etagsRatio).toFixed(2);

    measures.lazyLoadRatio = res.ratio;
    measures.lazyLoadRatio = parseFloat(measures.lazyLoadRatio).toFixed(2) ? parseFloat(measures.lazyLoadRatio).toFixed(2) : 0.0 ;

    measures.imagesWithoutLazyLoading = res.imagesNoLazy;

    measures.imgResize = await getImagesResized(page).then(e => e.ratio);
    measures.imgResize = isNaN(parseFloat(measures.imgResize).toFixed(2)) ? parseFloat(measures.imgResize).toFixed(2) : 0.0;

    measures['Http1.1/Http2requests'] = await (counter_http1 / measures.RequestsNb) * 100;
    measures['Http1.1/Http2requests'] = parseFloat(measures['Http1.1/Http2requests']).toFixed(2);

    measures['DOMsize(nb elem)'] = await page.$$eval('*', array => array.length);

    measures.pluginsNb = await getPlugins(page).then(e => e ? e.length : 0);

    measures.imgSrcEmpty = await getImagesSrcEmpty(page);
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

async function isStatic(page,measures) {

    /*
           1. Check if URLs end with .html, .htm, .shtml and doesn't contain '?'.
           2. Static websites rarely set cookies/sessions.
           3. Static webpage use HTML,JS and CSS contrary to a dynamic page who use php,cgi,ajax,asp,asp.net ...  
           4. Can we login ? If yes then its not a static page because he don't use database.

           => This function is not 100% true, a dynamic webpage may use the same tools as static page so don't 

           More info : https://iconicdigitalworld.com/how-to-check-if-a-website-is-dynamic-or-or-static/#:~:text=To%20find%20out%20how%20to,JSP%2C%20the%20page%20is%20dynamic.
       */
 
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
        let scripts = document.scripts;

        var countCSS = 0;
        var countJS = 0;

        for (let i of stylesheets) {
            if (!i.href) {
                countCSS += 1;
            }
        }
        for (let i of scripts) {
            if (!i.href) {
                countJS += 1;
            }
        }
        return {countCSS,countJS};
    })

    return result.countCSS,result.countJS;

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
                if(!img.isASvg && img.src != "")
                notLazy.push(img.src);
            }
        }

        return { totalImages, lazyImages, notLazy };
    })

    const ratio = ((result.lazyImages / result.totalImages) * 100);
    const imagesNoLazy = result.notLazy;
    return { ratio, imagesNoLazy };
}

async function getImagesSrcEmpty(page){
    const result = await page.evaluate(() => {
        let imgs = document.querySelectorAll('img');
        let count = 0 ;
        for (let img of imgs) {
            const attr = img.getAttribute('src');
            if (attr == "") {
                count+=1;
            }
        }

        return count;
    })

    return result;

}
async function getPlugins(page) {
    const plugins = page.evaluate(() => {
        return Navigator.plugins;
    })
    return plugins;
}