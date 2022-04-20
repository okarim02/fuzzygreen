const common = require("./common")
// optional : var lodash = require('lodash');
const scrapper = require('./scrapper')
const ecoScore = require('./ecoScore')

async function main(){

    console.log("Site web testé : ",common.baseUrl)
    const data = await scrapper.getPageMetrics(common.baseUrl,async (data,response)=>{
        if(response){
            data.size /= 1000
            console.log("Data",data)
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
