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

    await clust(data.urls,data.criteres_selected).then((websiteData)=>{
        const time = Date.now() - requestTime;

        // Create fuzzy logics
        //fuzzylogic.launch(websiteData);

        // Write the results 
        tools.writeToFile('./services/result.json',JSON.stringify(websiteData));
        
        console.log("Middleware analyse : Done");
        
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

        // next(JSON.stringify(websiteData));
    })
    .catch((err)=>{
        console.log("err:",err);
        
        response.json({
            status:'failure',
            message: 'Traitement interrompue'
        });
    })
});

app.get("/getResult",(req,res,next)=>{
    console.log("Compute done .");
    res.render("analyse.ejs")
});

app.listen(PORT, () => console.log(`Listening at ${PORT} (go to 'localhost:3000')`));


