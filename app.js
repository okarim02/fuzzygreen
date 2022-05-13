// Imports
const express = require('express');
const res = require('express/lib/response');
const app = express();

const main = require('./main');
const fuzzylogic = require('./fuzzyLogic');
const cluster = require('./cluster');
const tools = require('./tools');
const common = require('./common');
const PORT = 3000;

// config
app.use(express.static(__dirname + '/public'));
app.use('/css',express.static(__dirname+'public/css'));
app.use('/js',express.static(__dirname+'public/js'));
app.use('/img',express.static(__dirname+'public/img'));

// Same as bodyParser
// http://expressjs.com/fr/api.html#express.json
app.use(express.json({
    limit: '1mb'
}));

// Set template Engine
app.set('view engine','ejs');


// racine
app.get('', (req,res)=>{
    res.render("partials/index.ejs",{"criteres":common.criteres});
})

app.post('/api',async (request,response,next)=>{
    console.log("Requête reçu !");
    var requestTime = Date.now();

    const data = request.body;

    await cluster.clust(data.urls,data.criteres_selected).then((websiteData)=>{
        const time = Date.now() - requestTime;

        // Create fuzzy logics
        fuzzylogic.launch(websiteData);
        
        // Met à jour les critères 
        common.criteres_toNotCount = data.criteres_selected;

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

app.listen(PORT, () => console.log(`Listening at ${PORT} (go to 'localhost:3000')`));


