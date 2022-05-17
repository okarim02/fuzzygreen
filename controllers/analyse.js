const { clust } = require("../services/cluster");
const tools = require('../services/tools');
const common = require('../services/common');
const fuzzylogic = require('../services/fuzzyLogic');
const main = require('../services/main');

exports.analyse = (req,res,next)=>{
    let results = clust.first(req.siteAnalyse,req.criteres_selected);
}

exports.compute = async (request,response,next)=>{
    console.log("Middleware analyse : Requête reçu !");
    
    var requestTime = Date.now();

    // todo : no request ?? ???? 
    console.log("Requet body : ", request.body);
    console.log("Response body ", response.body);
    
    const data = request.body;

    await clust(data.urls,data.criteres_selected).then((websiteData)=>{
        const time = Date.now() - requestTime;

        // Create fuzzy logics
        //fuzzylogic.launch(websiteData);

        // Write the results 
        tools.writeToFile('../services/result.json',JSON.stringify(websiteData));
        /*
        response.json({
            status:'success',
            message: `Traitement finit en ${time} ms`,
            data : JSON.stringify(websiteData)
        });*/
        console.log("Middleware analyse : Done");
        next(JSON.stringify(websiteData));
    })
    .catch((err)=>{
        console.log("err:",err);
        /*
        response.json({
            status:'failure',
            message: 'Traitement interrompue'
        });*/
        next(err);
    })

}