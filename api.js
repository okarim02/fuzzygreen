const fetch = (...args) => import('node-fetch')
              .then(({default: fetch}) => fetch(...args));
const lighthouse = require("lighthouse");

async function askForHost(domain){
    const api_url = `https://admin.thegreenwebfoundation.org/api/v3/greencheck/${domain}`
    const response = await fetch(api_url);
    const data = await response.json();
    return data
}



module.exports = { 
    // API : https://admin.thegreenwebfoundation.org/api-docs/
    isGreen : async function isGreen(domain){
        let retour = {}

        const result = await askForHost(domain)

        retour = result;
        
        if(result.green){
            console.log("Hébergeur green !")
            const response = await fetch(`https://admin.thegreenwebfoundation.org/data/hostingprovider/${result.hosted_by_id}`)
            const moreData = await response.json();

            retour.moreData = moreData;
            
        }else{
            console.log("Hébergeur non green")
        }
        
        return retour;
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
        ).then(res => res.json());

        return data.mobileFriendliness == 'MOBILE_FRIENDLY';
    },

    infoAboutPluginAndTemplate : async function info(url){
        var params = {
            "url": url,
        }
        const data = await fetch(`https://api.wappalyzer.com/v2/lookup/?urls=https://www.wappalyzer.com&sets=all?key=${process.env.MOBILE_FRIENDLY_API}`, 
            {
                method: 'POTS',
                body: JSON.stringify(params),
                headers: { 'Content-Type': 'application/json' }
            }
        ).then(res => res.json());
    }


    
}