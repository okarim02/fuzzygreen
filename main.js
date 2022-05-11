const common = require("./common");
// optional : var lodash = require('lodash');
const scrapper = require('./scrapper');
const ecoScore = require('./ecoIndex');
const api = require('./api');
const tools = require("./tools");

module.exports.start = async function main(url,page){
    
    const baseUrl = url ;
    console.log("Site web testé : ",baseUrl)
    
    var result = {};
    result.url = url;

    await scrapper.getPageMetrics(baseUrl,page,(data,response)=>{
        if(response){
            data.size = Math.round(data.size/1000);
            result = data;
        }
    }).then(async ()=>{
        console.log("Wooo that work");
        const ecoIndex = await ecoScore.getEcoIndex(result.domSize,result.size,result.nbRequest);
        const domainName = tools.getDomain(baseUrl);
       
        /*const resultGreen = await api.isGreen(domainName);
        //result.plugins = await api.infoAboutPluginAndTemplate(url);

        // Took so many time that the server response crash
        // result.isMobileFriendly = await api.isMobileFriendly(url); // Took so long, fix this !
        result.host={ 
            "isGreen":resultGreen.green,
            "energy": resultGreen.moreData ? resultGreen.moreData[0].model : ""
        };*/
        result.ecoIndex = ecoIndex.grade;
    }).catch(async e=>{ // todo , gérer l'erreur : faux url.
        console.error("oops something went wrong");
        result = new Error("Oops something went wrong");
    });

    return result;
}