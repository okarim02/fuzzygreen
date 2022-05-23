const express = require("express");
let router = express.Router();
const controllerAnalyse = require("../controllers/analyse");

// racine
router.get('/', (req,res)=>{
    res.render("index.ejs");
})

router.get('/result',(req,res)=>{
    res.render("result.ejs");
})
/*
router.post('/api',async (request,response,next)=>{
    console.log("Requête reçu !");
    var requestTime = Date.now();

    const data = request.body;

    await cluster.clust(data.urls,data.criteres_selected).then((websiteData)=>{
        const time = Date.now() - requestTime;

        // Create fuzzy logics
        //fuzzylogic.launch(websiteData);

        // Write the results 
        tools.writeToFile('result.json',JSON.stringify(websiteData));

        response.json({
            status:'success',
            message: `Traitement finit en ${time} ms`,
            data : JSON.stringify(websiteData)
        });
    })
    .catch((err)=>{
        console.log("err:",err);
        response.json({
            status:'failure',
            message: 'Traitement interrompue'
        });
    })

    console.log("Done");
    next();

});
*/
/*
router.get("/api/getResult",(req,res,next)=>{
    res.render("analyse.ejs")
});
*/

module.exports = router;