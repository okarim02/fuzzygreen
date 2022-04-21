const common = require("./common")
// optional : var lodash = require('lodash');
const scrapper = require('./scrapper')
const ecoScore = require('./ecoScore')
const whois = require("node-whois")

async function main(){
    const baseUrl = common.urls[0];
    console.log("Site web testé : ",baseUrl)

    const domainName = baseUrl.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];

    console.log(domainName)
    
    whois.lookup(domainName, function(err, data) {
        if(err){
            return {}
        }
        var lines = data.split('\n')
        for(let i = 0 ; i < lines.length;i++){
            if(lines[i].includes("Name Server:") || lines[i].includes("Registrar:") || lines[i].includes("registrar:")){
                var heb;
                if(lines[i].includes("Registrar:") || lines[i].includes("registrar:")){
                    lines[i].replace(/\s/g, '');
                    let line = lines[i].split(':')[1].replace(/\s/g,'').toLowerCase();
                    heb = line.charAt(0).toUpperCase() + line.slice(1);
                }else{
                    lines[i].replace(/\s/g, '');
                    let line = lines[i].split(':')[1];
                    heb = line.split('.')[1].toUpperCase()
                }
               
                if(common.green_hosts.France.includes(heb)){
                    console.log(`L'hébergeur ${heb} est vert`)
                    return heb
                }else{
                    console.log(`L'hébergeur ${heb} n'est pas dans la liste des heb vert : ${common.green_hosts.France}`)
                    return heb
                }
                
            }
        }
    })


    const data = await scrapper.getPageMetrics(baseUrl,async (data,response)=>{
        if(response){
            data.size = Math.round(data.size/1000) 
            console.log("Data",data)
            console.log()
            // todo : Fixer le calcule du 'size' dans scrapper.js 
            await ecoScore.getEcoIndex(data.domSize,data.size,data.nbRequest).then((score)=>{console.log(score)})
            return data
        }
    }).then(await function(data){
        // wtf ??? todo : fixer ca 
        console.log("Data",data)
        return data
    })
    /*
    const ecoGrade = await ecoScore.getEcoIndex(data.domSize,data.size,data.nbRequest).then((score)=>{return score})

    console.log(data)
    console.log(ecoScore)
    */
}

main()
