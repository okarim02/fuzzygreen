var main = require("./main");
const { Cluster } = require('puppeteer-cluster'); 
const common = require("./common")

function Result(tmp){
    let obj = {};
    for(let i in tmp){
        obj[i] = tmp[i];
    }
    return obj;
}

module.exports.clust = async function first(urls,criteres_selected){
    // init concurrency
    const cluster = await Cluster.launch({
        concurrency : Cluster.CONCURRENCY_PAGE,
        maxConcurrency:200, // Max pages
        timeout:60000, // 60s per page
        puppeteerOptions:{
            devtools: true,
            headless: true,
            executablePath:process.env.EXECUTE_PATH_CHROMIUM
        },
    });

    var results = [];

    cluster.on('taskerror',(err,data)=>{
        console.log(`Error crawling ${data}: ${err.message}`);
    });

    await cluster.task(async ({page,data: url})=>{
        const res = await main.start(url,page,criteres_selected);
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