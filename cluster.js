var main = require("./main");
const { Cluster } = require('puppeteer-cluster'); 
const common = require("./common")

function Result(tmp){
    return {
        'size':tmp.size,
        'nbRequest': tmp.nbRequest,
        'domSize': tmp.domSize,
        'filesNotMin': tmp.filesNotMin,
        'policeUtilise': tmp.policeUtilise,
        'etagsNb':tmp.etagsNb,
        'imagesWithoutLazyLoading':tmp.imagesWithoutLazyLoading,
        'cssFiles': tmp.cssFiles,
        'cssOrJsNotExt': tmp.cssOrJsNotExt,
        'filesWithError': tmp.filesWithError,
        'socialButtonsFound': tmp.socialButtonsFound,
        'nbOfImagesWithSrcEmpty': tmp.nbOfImagesWithSrcEmpty,
        'isStatic': tmp.isStatic,
        'poweredBy': tmp.poweredBy,
        'protocolHTTP': tmp.protocolHTTP,
        'cms': tmp.cms,
        'loadTime': tmp.loadTime,
        'ratioLazyLoad': tmp.ratioLazyLoad,
        'ratioimagesResizedInPage': tmp.ratioimagesResizedInPage,
        'ratioHttp1': tmp.ratioHttp1,
        'plugins': tmp.plugins,
        'ratio_etags': tmp.ratioHttp1,
        'host': tmp.host,
        'ecoIndex': tmp.ecoIndex,
        'isMobileFriendly':tmp.isMobileFriendly

    };
}

module.exports.clust = async function first(urls){
    // init concurrency
    const cluster = await Cluster.launch({
        concurrency : Cluster.CONCURRENCY_PAGE,
        maxConcurrency:200, // Max pages
        timeout:60000, // 60s per page
        puppeteerOptions:{
            devtools: true,
            headless: true,
        },
    });

    var results = [];

    cluster.on('taskerror',(err,data)=>{
        console.log(`Error crawling ${data}: ${err.message}`);
    });

    await cluster.task(async ({page,data: url})=>{
        const res = await main.start(url,page);
        return res;
    });

    for(let i = 0 ; i < urls.length;i++) {
        const tmp = await cluster.execute(urls[i]);
        let r = Result(tmp);
        let obj = {};
        obj[urls[i]] = r;
        results.push(obj);
    }

    await cluster.idle();
    await cluster.close();

    return results; 

}