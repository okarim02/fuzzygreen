const express = require('express');
const res = require('express/lib/response');
const app = express();

const main = require('./main');
const fuzzylogic = require('./fuzzyLogic');
const cluster = require('./cluster');

app.listen(3000, () => console.log("Listening at 3000 (go to 'localhost:3000')"));
app.use(express.static(__dirname+'/public'));
app.set('view engine','ejs')

// Same as bodyParser
// http://expressjs.com/fr/api.html#express.json
app.use(express.json({
    limit: '1mb'
}));

app.post('/api',async (request,response,next)=>{
    console.log("Requête reçu !");
    var requestTime = Date.now();
    

    const data = request.body;

    await cluster.clust(data.urls).then((websiteData)=>{
        const time = Date.now() - requestTime;

        // Create fuzzy logics
        fuzzylogic.getSpecificData(websiteData);

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

