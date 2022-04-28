const fetch = (...args) => import('node-fetch')
              .then(({default: fetch}) => fetch(...args));

async function askForHost(domain){
    // API : https://admin.thegreenwebfoundation.org/api-docs/
    const api_url = `https://admin.thegreenwebfoundation.org/api/v3/greencheck/${domain}`
    const response = await fetch(api_url);
    const data = await response.json();
    return data
}

module.exports.isGreen = async function isGreen(domain){
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
    
}