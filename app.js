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

const fs = require('fs');


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
    
    var requestTime = Date.now();

    const data = request.body;

    tools.writeToFile('./services/crits.json',JSON.stringify(data.criteres_selected));

    await clust(data.urls,data.criteres_selected).then((websiteData)=>{
        const time = Date.now() - requestTime;

        // Create fuzzy logics
        //fuzzylogic.launch(websiteData);

        // Write the results
        // Todo : Utiliser des sessions plutot qu'un fichier pour sauvegarder les données.
        tools.writeToFile('./services/result.json',JSON.stringify(websiteData));
        
        
        const obj = {
            websiteData : websiteData,
            redirected : "/getResult"
        }
        
        response.json({
            status:'success',
            message: `Traitement finit en ${time} ms`,
            redirected: '/analyse',
            data : JSON.stringify(obj)
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
    const content = fs.readFileSync('./services/result.json');
    res.render("analyse.ejs",{
        "computedData" : content ? JSON.parse(content): false
    })
})

app.post("/getResult/analyse",async (req,res,next)=>{
    // analyser la page 
    const crits = await fs.readFileSync("./services/crits.json"); // Dernier critères qu'on a sauvegarder
    const dataRead = await fs.readFileSync("./services/result.json"); // Dernière donnèes scanné
    const computed_data = JSON.parse(dataRead);
    const url_data = await clust(req.body.url,crits);

    // Ajout des résultats du site analysé dans le fichier result.json
    // todo : fixer l'erreur
    fs.appendFile("./services/result.json", JSON.stringify(url_data),(err)=>{
        if(err) throw err;
    })

    console.log("Computed data : ",computed_data);
    console.log("Site analysé : ",url_data);

    // Appeler fuzzy logic
    // récuperer le résultat
    fuzzylogic.launch(computed_data,url_data);

    res.json({
        status:'success',
        message: `Traitement terminé`,
        redirected: '/result',
    });
    // Ne pas oublier d'implémenter les options (telecharger en csv etc ...)
})

app.get("/getData",async (req,res,next)=>{
    console.log("Récupération des données");
    const dataRead = await fs.readFileSync("./services/result.json"); // Dernière donnèes scanné
    const computed_data = JSON.parse(dataRead);
    res.json({
        status:'success',
        data : JSON.stringify(computed_data)
    });
});

app.listen(PORT, () => console.log(`Listening at ${PORT} (go to 'localhost:3000')`));