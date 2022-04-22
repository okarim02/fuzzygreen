const fetch = require("node-fetch"); // todo : uninstall node-whois

// API : https://admin.thegreenwebfoundation.org/api-docs/

async function askForHost(domain){
    const api_url = `https://admin.thegreenwebfoundation.org/api/v3/greencheck/${domain}`
    const response = await fetch(api_url);
    const data = await response.json();

    return data
}


module.exports.isGreen = async function isGreen(domain){
    
    const result = await askForHost(domain)
    
    console.log("Result : ",result)

    if(result.green){
        console.log("Hébergeur green !")
        fetch(`https://admin.thegreenwebfoundation.org/data/hostingprovider/${result.hosted_by_id}`).then(data=>{
            //console.log(data)
        })   
    }else{
        console.log("Hébergeur non green")
    }

    
}

//this.isGreen("seo-elp.fr")