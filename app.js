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

app.post("/api",async(request,response)=>{
    console.log("Middleware analyse : Requête reçu !");
    
    var requestTime = Date.now();

    const data = request.body;

    tools.writeToFile('./services/crits.json',JSON.stringify(data.criteres_selected));

    console.log("A");

    await clust(data.urls,data.criteres_selected).then((websiteData)=>{
        const time = Date.now() - requestTime;

        // Create fuzzy logics
        //fuzzylogic.launch(websiteData);

        // Write the results 
        tools.writeToFile('./services/result.json',JSON.stringify(websiteData));
        
        
        const obj = {
            websiteData : websiteData,
            redirected : "/getResult"
        }
        
        response.json({
            status:'success',
            message: `Traitement finit en ${time} ms`,
            redirected: '/getResult',
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

app.get("/getResult",async (req,res,next)=>{
    //const content = await tools.readFile("./services/result.json");
    const content = fs.readFileSync('./services/result.json');
    //let student = JSON.parse(rawdata);
    res.render("analyse.ejs",{
        "computedData": content ? content.length > 0 : false 
    })
});

app.post("/getResult/analyse",async (req,res,next)=>{
    // analyser la page 
    const crits = await fs.readFileSync("./services/crits.json"); // Dernier critères qu'on a sauvegarder
    const dataRead = await fs.readFileSync("./services/result.json"); // Dernière donnèes scanné
    const computed_data = JSON.parse(dataRead);
    const result = await clust(req.body.url,crits);

    console.log("Computed data : ",computed_data);
    console.log("Site analysé : ",result);

    // Appeler fuzzy logic
    // récuperer le résultat
    fuzzylogic.launch(computed_data,result);

    // Renvoyer le résultat en redirigant vert la page result
    res.json({
        status:'success',
        message: `Traitement terminé`,
        redirected: '/result'
    });

    // Ne pas oublier d'implémenter les options (telecharger en csv etc ...)
})

app.get("/result",(req,res,next)=>{
    
    
});

app.listen(PORT, () => console.log(`Listening at ${PORT} (go to 'localhost:3000')`));