const common = require("./common")
// optional : var lodash = require('lodash');
const scrapper = require('./scrapper')
const ecoScore = require('./ecoScore')
const fuzzy = require('./fuzzy')

async function main(){

    console.log("Site web testé : ",common.baseUrl)

    const data = await scrapper.getPageMetrics(common.baseUrl,async (data,response)=>{
        if(response){
            data.size /= 1000
            console.log("Data",data)
            await ecoScore.getEcoIndex(data.domSize,data.size,data.nbRequest).then((score)=>{console.log(score)})
            await fuzzy.requestsFuzzyLogic(data.nbRequest)
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
