const common = require("./common")
// optional : var lodash = require('lodash');
const scrapper = require('./scrapper')
const ecoScore = require('./ecoIndex')
const api = require('./api')
const tools = require("./tools")

module.exports.start = async function main(url){
    
    const baseUrl = url ;
    console.log("Site web testé : ",baseUrl)
    
    var result = {};
    result.url = url;

    await scrapper.getPageMetrics(baseUrl,(data,response)=>{
        if(response){
            data.size = Math.round(data.size/1000);
            result = data;
            result.ratio_etags = `${(data.etagsNb/data.nbRequest)*100} %`;
            result.ratioLazyLoad = `${result.ratioLazyLoad}%`;
            result.JSHeapUsedSize = `${result.JSHeapUsedSize / 1000} mo`;
            result.ratioHttp1 = `${result.ratioHttp1} %`;
            // todo : classer les polices (sont ils dans la base) + comparer le nombre à la norme
            // 3 polices max par site web
            if(result.policesUtilise.length>3){
                console.log("Nombre de police customisé utiliser : ",result.policesUtilise.length);
                console.log("Veuillez vous limiter à 3 polices customisé");
            } 
            result.cssFiles = `${result.cssFiles} ${ result.cssFiles > 3 ? "(>3 veuillez limiter les feuilles css)" : ""}`;
        }else{
            
        }
    }).then(async ()=>{
        console.log("Wooo that work");
        const ecoIndex = await ecoScore.getEcoIndex(result.domSize,result.size,result.nbRequest);
        const domainName = tools.getDomain(baseUrl);
        const resultGreen = await api.isGreen(domainName);
        //result.plugins = await api.infoAboutPluginAndTemplate(url);
        result.isMobileFriendly = await api.isMobileFriendly(url); // Took so long, fix this !
        result.host={ 
            "isGreen":resultGreen.green,
            "energy": result.moreData ? resultGreen.moreData[0].model : ""
        };

        result.ecoIndex = ecoIndex.grade;
        // test
        //tools.writeToFile("result.json",JSON.stringify(result));

    }).catch(async e=>{ // todo , gérer l'erreur : faux url.
        console.log("oops something went wrong");
        result = new Error("Oops something went wrong");
    });

    console.log(result);
    return result;
}
/* TEST */ 
this.start("http://www.angrybirds.com/");