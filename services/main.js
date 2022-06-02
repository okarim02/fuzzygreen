const common = require("./common");
// optional : var lodash = require('lodash');
const scrapper = require('./scrapper');
const api = require('./api');
const tools = require("./tools");

module.exports.start = async function main(url,page,criteres_selected){
    
    const baseUrl = url ;
    console.log("Site web testé : ",baseUrl);
    console.log("Critères séléctionner : ",criteres_selected);
    
    var result = {};
    result.url = url;

    await scrapper.getPageMetrics(baseUrl,page,criteres_selected,(data,response)=>{
        if(response){
            data['PageSize(Ko)'] = Math.round(data['PageSize(Ko)']/1000);
            result = data;
        }
    }).then(async ()=>{
        console.log("Wooo that work");
        const domainName = tools.getDomain(baseUrl);
        /*
        //result.plugins = await api.infoAboutPluginAndTemplate(url);

        */
        // Took so many time that the server response crash
        if(criteres_selected.includes("isMobileFriendly")){
            result.isMobileFriendly = await api.isMobileFriendly(url)
        }; // Took so long, fix this !
        
        if(criteres_selected.includes("host")){
            const resultGreen = await api.isGreen(domainName);
            result.host={ 
                "isGreen":resultGreen.green,
                "energy": resultGreen.moreData ? resultGreen.moreData[0].model : ""
            };
        } 
    }).catch(async e=>{ // todo , gérer l'erreur : faux url.
        console.error("oops something went wrong => ",e);
        throw new Error("Oops something went wrong");
    });

    console.log(result);

    return result;
}

async function test(){
    /*
    tools.getIp(await tools.getDomain("http://estarecherche.ovh/"),function(response){
        askFor_co2Intensity(response);
    });*/
    
    const res = await api.isGreen(tools.getDomain("https://www.lisi-automotive.com/en/products/clipped-solutions/"));

}

test()