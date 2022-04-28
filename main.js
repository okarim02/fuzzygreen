const common = require("./common")
// optional : var lodash = require('lodash');
const scrapper = require('./scrapper')
const ecoScore = require('./ecoIndex')
const greenhost = require('./green-host')
const tools = require("./tools")

module.exports.start = async function main(url){
    const baseUrl = url ;

    if(!tools.isUrl(baseUrl)){
        console.error("This is note an url : ",baseUrl);
        return ;
    }
    
    console.log("Site web testé : ",baseUrl)

    const domainName = baseUrl.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];

    const resultGreen = await greenhost.isGreen(domainName);

    var result = {};
    result.url = url;
    await scrapper.getPageMetrics(baseUrl,(data,response)=>{
        if(response){
            data.size = Math.round(data.size/1000);
            result = data;
            result.ratio_etags = `${(data.etagsNb/data.nbRequest)*100} %`;
            result.ratioLazyLoad = `${result.ratioLazyLoad}%`;
            result.JSHeapUsedSize = `${result.JSHeapUsedSize / 1000} mo`;
            // todo : classer les polices (sont ils dans la base) + comparer le nombre à la norme
            // wappalyzer
        }
    });
    const ecoIndex = await ecoScore.getEcoIndex(result.domSize,result.size,result.nbRequest);

    result.host={ 
        "isGreen":resultGreen.green,
        "energy": result.moreData ? resultGreen.moreData[0].model : ""
    };

    result.ecoIndex = ecoIndex.grade;
    // test
    //tools.writeToFile("result.json",JSON.stringify(result));
    console.log(result)
    return result;
}

// TEST 
/*
for(let i of common.page_to_analyze){
    this.start(i);
}*/
//this.start(common.page_to_analyze[6]);
this.start(common.urls[0])