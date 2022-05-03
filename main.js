const common = require("./common")
// optional : var lodash = require('lodash');
const scrapper = require('./scrapper')
const { Cluster } = require('puppeteer-cluster'); // https://www.npmjs.com/package/puppeteer-cluster
const ecoScore = require('./ecoIndex')
const api = require('./api')
const tools = require("./tools")

module.exports.start = async function main(urls){

    // init concurrency
    const cluster =await Cluster.launch({
        concurrency : Cluster.CONCURRENCY_PAGE,
        maxConcurrency:100, // Max pages
        puppeteerOptions:{
            devtools: true,
            headless: true,
        },
    })


    cluster.on('taskerror',(err,data)=>{
        console.log(`Error crawling ${data}: ${err.message}`);
    });

    const resultats = async ({page,data: url})=>{

        //result.plugins = await api.infoAboutPluginAndTemplate(url);
        //result.isMobileFriendly = await api.isMobileFriendly(url);

        if(!tools.isUrl(url)){
            console.error("This is note an url : ",url);
            return ;
        }
        const baseUrl = url ;
        console.log("Site web testé : ",baseUrl)
        
        var result = {};
    
        const domainName = tools.getDomain(baseUrl);
        const resultGreen = await api.isGreen(domainName)

        await scrapper.getPageMetrics(baseUrl,page,(data,response)=>{
            if(response){
                data.size = Math.round(data.size/1000);
                result = data;
                result.ratio_etags = `${(data.etagsNb/data.nbRequest)*100} %`;
                result.ratioLazyLoad = `${result.ratioLazyLoad}%`;
                result.JSHeapUsedSize = `${result.JSHeapUsedSize / 1000} mo`;
                // todo : classer les polices (sont ils dans la base) + comparer le nombre à la norme
                // 3 polices max par site web
                if(result.policesUtilise.length>3){
                    console.log("Nombre de police customisé utiliser : ",result.policesUtilise.length);
                    console.log("Veuillez vous limiter à 3 polices customisé");
                } 
                result.cssFiles = `${result.cssFiles} ${ result.cssFiles > 3 ? "(>3 veuillez limiter les feuilles css)" : ""}`;
    
            }
        });
        const ecoIndex = await ecoScore.getEcoIndex(result.domSize,result.size,result.nbRequest);

        result.host={ 
            "isGreen":resultGreen.green,
            "energy": result.moreData ? resultGreen.moreData[0].model : ""
        };

        result.ecoIndex = ecoIndex.grade;
        result.url = url;

        // test
        //tools.writeToFile("result.json",JSON.stringify(result));

        return result;
    };

    var results = new Map();

    for(let i = 0 ; i < urls.length;i++) {
        results.set(urls[i],await cluster.queue(urls[i],resultats));
    }

    await cluster.idle();
    await cluster.close();

}

this.start(common.lisi_pages);