var main = require("./main");
const { Cluster } = require('puppeteer-cluster'); 
const common = require("./common")

module.exports.clust = async function first(urls){
    // init concurrency
    const cluster =await Cluster.launch({
        concurrency : Cluster.CONCURRENCY_PAGE,
        maxConcurrency:100, // Max pages
        puppeteerOptions:{
            devtools: true,
            headless: true,
        },
    });

    cluster.on('taskerror',(err,data)=>{
        console.log(`Error crawling ${data}: ${err.message}`);
    });

    const resultats = async ({page,data: url})=>{
        return await main.start(url,page);
    };

    var results = new Map();

    for(let i = 0 ; i < urls.length;i++) {
        results.set(urls[i],await cluster.execute(urls[i],resultats));
    }

    await cluster.idle();
    await cluster.close();

    console.log(results);

}
