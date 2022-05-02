const common = require("./common")
// optional : var lodash = require('lodash');
const scrapper = require('./scrapper')
const ecoScore = require('./ecoIndex')
const api = require('./api')
const tools = require("./tools")

module.exports.start = async function main(url){
    if(!tools.isUrl(url)){
        console.error("This is note an url : ",url);
        return ;
    }
    const baseUrl = url ;
    console.log("Site web testé : ",baseUrl)
    
    var result = {};
    result.url = url;

    const domainName = tools.getDomain(baseUrl);
    const resultGreen = await api.isGreen(domainName)
    
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
            result.cssFiles = `${result.cssFiles} ${ result.cssFiles > 3 ? "(>3 veuillez limiter les feuilles css)" : ""}`;
            // wappalyzer pour 
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
    console.log(result);
    return result;
}


this.start("https://www.lisi-automotive.com/en/products/clipped-solutions/fasteners-for-panels/");
//this.start(common.urls[0])