const common = require("./common")
// optional : var lodash = require('lodash');
const scrapper = require('./scrapper')
const ecoScore = require('./ecoIndex')
const api = require('./api')
const tools = require("./tools")

module.exports.start = async function main(url){
    const baseUrl = url ;

    if(!tools.isUrl(baseUrl)){
        console.error("This is note an url : ",baseUrl);
        return ;
    }
    
    console.log("Site web testé : ",baseUrl)

    const domainName = tools.getDomain(baseUrl);
    const resultGreen = await api.isGreen(domainName)
    
    var result = {};

    //result.plugins = await api.infoAboutPluginAndTemplate(url);
    //result.isMobileFriendly = await api.isMobileFriendly(url);

    await scrapper.getPageMetrics(baseUrl,(data,response)=>{
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
            // wappalyzer pour 
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
    console.log(result);
    return result;
}


this.start("http://usainbolt.com/");
//this.start(common.page_to_analyze[6]);
//this.start(common.urls[0])