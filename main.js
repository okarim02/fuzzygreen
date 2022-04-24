const common = require("./common")
// optional : var lodash = require('lodash');
const scrapper = require('./scrapper')
const ecoScore = require('./ecoScore')
const greenhost = require('./green-host')

async function main(url){
    const baseUrl = url ? url : common.urls[1] ;
    
    console.log("Site web testé : ",baseUrl)

    const domainName = baseUrl.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];

    greenhost.isGreen(domainName)

    const data = await scrapper.getPageMetrics(baseUrl,async (data,response)=>{
        if(response){
            data.size = Math.round(data.size/1000)
            console.log("Ratio etags : ",(data.etagsNb/data.nbRequest)*100,"%") 
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
