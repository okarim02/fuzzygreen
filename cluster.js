var main = require("./main");
const { Cluster } = require('puppeteer-cluster'); 
const common = require("./common")

module.exports.clust = async function first(urls){
    // init concurrency
    const cluster = await Cluster.launch({
        concurrency : Cluster.CONCURRENCY_PAGE,
        maxConcurrency:100, // Max pages
        puppeteerOptions:{
            devtools: true,
            headless: true,
        },
    });

    var results = {};

    cluster.on('taskerror',(err,data)=>{
        console.log(`Error crawling ${data}: ${err.message}`);
    });

    await cluster.task(async ({page,data: url})=>{
        const res = await main.start(url,page);
        return res;
    });

    for(let i = 0 ; i < urls.length;i++) {
        const r = await cluster.execute(urls[i]);
        results[urls[i]] = r;
    }

    await cluster.idle();
    await cluster.close();

    return results;

}
