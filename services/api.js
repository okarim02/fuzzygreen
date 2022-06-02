const { response } = require('express');
const fetch = require('node-fetch');

//const lighthouse = require("lighthouse");
const tools = require('./tools');
require('dotenv').config();


async function askForHost(domain){
    console.log("URL:",domain);
    const api_url = `https://admin.thegreenwebfoundation.org/api/v3/greencheck/${domain}`
    const response = await fetch(api_url).catch(e=>{
        console.error("Something went wrong with the greencheck api...")
        console.error(e);
    })
    const data = await response.json();
    console.log("askForHost",data);
    return data
}

async function askFor_co2Intensity(ip){
    const api_url = `https://admin.thegreenwebfoundation.org/api/v3/ip-to-co2intensity/${ip}`
    const response = await fetch(api_url).catch(e=>{
        console.error("Something went wrong with the greencheck api calls co2intensity...");
        console.error(e);
    })
    const data = await response.json();
    console.log("co2:",data);

    return {
        "Country":data.country_name,
        "cO2 info":{
            "carbon_intensity":data.carbon_intensity,
            "generation_from_fossil":data.generation_from_fossil
        }
    }
}

async function askFor_provider(id){
    const response = await fetch(`https://admin.thegreenwebfoundation.org/data/hostingprovider/${id}`);
    return await response.json();
}

// https://static.electricitymap.org/api/docs/index.html#live-carbon-intensity
async function askFor_powers(countryCode){
    const response = await fetch(`https://api.co2signal.com/v1/latest?countryCode=${countryCode}`,{
        headers:{
            'auth-token': process.env.ELEC_MAP_API
        }
    });
    const data = await response.json();
    
    console.log("elecMap : ",data.data);
    
    return data;
}

module.exports = { 
    // API : https://admin.thegreenwebfoundation.org/api-docs/
    isGreen : async function isGreen(domain){
        let retour = {}
        const result = await askForHost(await domain);

        retour = result;

        if(result.green){
            console.log("Hébergeur green !")
            
        }else{
            console.log("Hébergeur non green")
        }

        retour.moreData = await askFor_provider(result.hosted_by_id);
        retour.moreData = {...retour.moreData,"powers":await askFor_powers('FR')}
        retour.moreData = {...retour.moreData,"co2 from greenfound":  await askFor_co2Intensity('164.132.103.230')}


        console.log("More data : ",retour.moreData);
        
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
    // Alternative : Use chrome then download plugin to test it :) 
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
