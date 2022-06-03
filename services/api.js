const { response } = require('express');
const { replaceStrings } = require('lighthouse/report/generator/report-generator');
const fetch = require('node-fetch');

//const lighthouse = require("lighthouse");
const tools = require('./tools');
require('dotenv').config();

// https://admin.thegreenwebfoundation.org/api-docs/
async function askForHost(domain){
    const api_url = `https://admin.thegreenwebfoundation.org/api/v3/greencheck/${domain}`
    const response = await fetch(api_url).catch(e=>{
        console.error("Something went wrong with the greencheck api...")
        console.error(e);
    })
    const data = await response.json();
    return data;
}

// https://admin.thegreenwebfoundation.org/api-docs/
async function askFor_co2_greenFound(ip){
    const api_url = `https://admin.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ip}`
    const response = await fetch(api_url).catch(e=>{
        console.error("Something went wrong with the greencheck api calls co2intensity...");
        console.error(e);
    })
    const data = await response.json();

    return {
        'country_code':data.country_code_iso_2,
        "cO2 info":{
            "carbon_intensity":data.carbon_intensity,
            "generation_from_fossil":data.generation_from_fossil
        }
    }
}

async function askFor_provider(id){
    const response = await fetch(`https://admin.thegreenwebfoundation.org/data/hostingprovider/${id}`).catch((err)=>{
        console.error("Error api ask_provider : ",err);
        throw err;
    })
    return await response.json();
}

// https://static.electricitymap.org/api/docs/index.html#live-carbon-intensity
async function askFor_co2_elecMap(countryCode){
    const response = await fetch(`https://api.co2signal.com/v1/latest?countryCode=${countryCode}`,{
        headers:{
            'auth-token': process.env.ELEC_MAP_API
        }
    }).catch(err=>{
        console.error("Erreur avec l'API elemap : ",err);
        return {
            "Erreur avec l'API ":err
        }
    })
    const data = await response.json();

    if(data.message){
        console.error(data.message);
        return data.message;
    }
    
    return {
        "carbonIntensity": data.data.carbonIntensity ? (data.data.carbonIntensity + " " +data.units["carbonIntensity"])  : "NaN",
        "fossilFuelPercentage":data.data.fossilFuelPercentage || "NaN"
    };
}

async function test(){
    /*
    Error log : 
    - 'utbm.fr' ne marche pas :l
    */
    console.log(await askForHost(await tools.getDomain("google.com")));
    // Test co2 data from electricity map api 
    //console.log(await askFor_co2_elecMap('FR'));
    console.log(await askFor_co2_elecMap('US'));


    // Test co2 data from electricity map 

    /*
    await tools.getIp("utbm.fr").then(async (res)=>{
        console.log("ip : ",res);
        console.log(await askFor_co2_greenFound(res));
    }).catch((err)=>{
        console.log("error :",err);
    })*/
    

}   

//test();

module.exports = { 
    // API : https://admin.thegreenwebfoundation.org/api-docs/
    isGreen : async function isGreen(domain){
        domain = await domain;
        console.log("is green test sur : ",domain);
        let retour = {}
        const result = await askForHost(domain);

        retour = result;

        if(result.green){
            console.log("Hébergeur green !")
            
        }else{
            console.log("Hébergeur non green")
        }

        retour.moreData = {}
        retour.moreData['hosted'] = await askFor_provider(result.hosted_by_id);
        
        await tools.getIp(domain).then(async (res)=>{
            console.log("ip :",res)
            retour.moreData["co2 from greenfound"] = await askFor_co2_greenFound(res);
            retour.moreData["co2 from electricity map"] = await askFor_co2_elecMap(retour.moreData["co2 from greenfound"].country_code);
            console.log("Isgreen retour : ", retour);
        }).catch((err)=>{
            console.log("error :",err);
        })
        
        return retour;
        
    },
    // https://static.electricitymap.org/api/docs/index.html#authentication
    energy_list : async function energy_list(){

    },
    // https://developers.google.com/webmaster-tools/search-console-api/reference/rest/v1/urlTestingTools.mobileFriendlyTest/run
    isMobileFriendly : async function isMobileFriendly(urlTo){
        var params = {
            "url": urlTo,
            "requestScreenshot": false
        }

        const data = await fetch(`https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run?key=${process.env.MOBILE_FRIENDLY_API}`, 
            {
                method: 'POST',
                body: JSON.stringify(params),
                headers: { 'Content-Type': 'application/json' }
            }
        ).then(res => res.json()).catch((err)=>{
            return null;
        }
        )

        return data.mobileFriendliness == 'MOBILE_FRIENDLY';
    },
    // https://api.builtwith.com/
    // Abandon ... Need money to work ...
    infoAboutPluginAndTemplate : async function info(url){
        console.log("Test infoAboutPlugins : ",url);
        const data = await fetch(`https://api.builtwith.com/v19/api.json?KEY=${process.env.BUILDWITH_API}&LOOKUP=${url}`).then(res => {
            console.log("API send success !");
            return res.json();
        }).catch((err)=>{
            console.error("Erreur fetch :",err);
        });
        const response = data.Results;
        console.log(response);
        if(!response.Technologies){
            // No plugins found
            return {}
        }
        return response.Technologies;
    },
}
