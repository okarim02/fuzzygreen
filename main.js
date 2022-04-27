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
    await scrapper.getPageMetrics(baseUrl,(data,response)=>{
        if(response){
            data.size = Math.round(data.size/1000);
            result = data
            result.ratio_etags = `${(data.etagsNb/data.nbRequest)*100} %`
            result.ratioLazyLoad = `${result.ratioLazyLoad}%`
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

    console.log("Result:",result);
    //return result;
}

// TEST 
this.start(common.urls[1]);