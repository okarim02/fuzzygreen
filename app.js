// Imports
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const routes = require("./routes");
const bodyParser = require('body-parser');

const { clust } = require("./services/cluster");
const tools = require('./services/tools');
const common = require('./services/common');
const fuzzylogic = require('./services/fuzzyLogic');
const main = require('./services/main');

// Sauvegarde les données dans la session de l'utilisateur
var sessionStorage = require('node-sessionstorage');


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
app.use(bodyParser.json());

// Set template Engine
app.set('view engine','ejs');

// MIddleware
app.post("/api",async(request,response,next)=>{
    console.log("Middleware analyse : Requête reçu !");

    sessionStorage.setItem('criteres', JSON.stringify(request.body.criteres_selected));

    await clust(request.body.urls,request.body.criteres_selected).then((websiteData)=>{
        const time = Date.now() - requestTime;
        
        sessionStorage.setItem('computedData',JSON.stringify(websiteData));
        
        response.json({
            status:'success',
            message: `Traitement finit en ${time} ms`,
            redirected: '/analyse',
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
    const content = sessionStorage.getItem('computedData');
    res.render("analyse.ejs",{
        "computedData" : content ? Object.keys(JSON.parse(content)).length>0: false
    })
})

// Après avoir entrer l'url, l'analyse de cette page en plus de la fuzzy logic se déclenche
// Puis le serveur redirigera une dernière fois l'utilisateur dans la page de résultat.
app.post("/getResult/analyse",async (req,res,next)=>{
    // analyser la page 
    const crits = JSON.parse(sessionStorage.getItem('criteres')); // Dernier critères qu'on a sauvegarder
    const computed_data = JSON.parse(sessionStorage.getItem('computedData'));
    const url_data = await clust(req.body.url,crits);

    sessionStorage.setItem('url_data', JSON.stringify(url_data));

    // Appel fuzzy logic
    // todo : récuperer le résultat
    fuzzylogic.launch(computed_data,url_data);

    res.json({
        status:'success',
        message: `Traitement terminé`,
        redirected: '/result',
    });
})

app.get("/getData",async (req,res,next)=>{
    console.log("/getData appelé");
    const obj = {
        "computed": JSON.parse(sessionStorage.getItem('computedData')),
        "url_data" : JSON.parse(sessionStorage.getItem('url_data')),
        "fuzzyData" : {}
    }
    await res.json({
        status:'success',
        message: `Traitement terminé`,
        data : await JSON.stringify(obj)
    });
})

app.get('/result',(req,res,next)=>{
    res.render("result.ejs");
})


app.listen(PORT, () => console.log(`Listening at ${PORT} (go to 'localhost:3000')`));