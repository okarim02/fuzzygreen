// Imports
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const routes = require("./routes");
const bodyParser = require('body-parser');

require('dotenv').config({path: __dirname + '/.env'})

const { clust } = require("./services/cluster");
const tools = require('./services/tools');
const common = require('./services/common');
const fuzzylogic = require('./services/fuzzyLogic');
const main = require('./services/main');

const fs = require('fs');

var requestTime = Date.now();


app.use("/",routes);

// config
app.use(express.static(__dirname + '/public'));
app.use('/css',express.static(__dirname+'public/css'));
app.use('/js',express.static(__dirname+'public/js'));
app.use('/img',express.static(__dirname+'public/img'));

// Same as bodyParser
// http://expressjs.com/fr/api.html#express.json
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// Set template Engine
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');

app.set('views', __dirname+'/views');

// MIddleware
app.post("/api",async(request,response,next)=>{
    console.log("Middleware analyse : Requête reçu !");
    
    await clust(request.body.urls,request.body.criteres_selected).then((websiteData)=>{
        const time = Date.now() - requestTime;
        
        response.json({
            status:'success',
            message: `Traitement finit en ${time} ms`,
            redirected: '/analyse',
            data : JSON.stringify(websiteData)
        });

        console.log("Middleware analyse : Done");

    })
    .catch((err)=>{
        console.log("err:",err);
        
        response.json({
            status:'failure',
            message: 'Traitement interrompue'
        });
    })
});

app.get("/analyse",(req,res,next)=>{
    res.render("analyse.ejs");
})

// Après avoir entrer l'url, l'analyse de cette page en plus de la fuzzy logic se déclenche
// Puis le serveur redirigera une dernière fois l'utilisateur dans la page de résultat.
app.post("/getResult/analyse",async (req,res,next)=>{
    // analyser la page 
    const crits = req.body.criteres; // Dernier critères qu'on a sauvegarder
    const computed_data = req.body.computedData; // Contiens les données de tous les sites analysés
    const url_data = await clust(req.body.url,crits); // Continens les données du site qu'on souhaite évaluer  

    // Appel fuzzy logic
    // todo : récuperer le résultat
    
    const fuzzyResult = await fuzzylogic.launch(computed_data,url_data);

    res.json({
        status:'success',
        message: `Traitement terminé`,
        redirected: '/result',
        data : JSON.stringify({
            "fuzzyResult": fuzzyResult,
            "url_data":url_data 
        })
    });
})

app.get('/result',(req,res,next)=>{
    res.render("result.ejs");
})

app.get("/result/modifyFuzzyRules/:criteria_id/",async(req,res,next)=>{
    res.render("editfuzzy.ejs")
})

app.post("/result/modifyFuzzyRules/",async(req,res,next)=>{
    const cordToModify = req.body.membership_functions_result;
    const fuzzy_data = req.body.fuzzyData;
    
    const fuzzyResult = await fuzzylogic.edit(fuzzy_data,cordToModify.criteria,cordToModify);
    res.json({
        status:'success',
        message: `Traitement terminé`,
        redirected: '/result',
        data : JSON.stringify({
            "fuzzyResult": fuzzyResult,
        })
    });
})

app.listen(PORT, async () => { 
    console.log(`Listening at ${PORT} (go to 'localhost:3000')`)
});

