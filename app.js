const express = require('express');
const res = require('express/lib/response');
const app = express();
const main = require('./main');

app.listen(3000, () => console.log("Listening at 3000 (go to 'localhost:3000')"));
app.use(express.static(__dirname+'/public'));
app.set('view engine','ejs')

// Same as bodyParser
// http://expressjs.com/fr/api.html#express.json
app.use(express.json({
    limit: '1mb'
}));

app.post('/api',async (request,response)=>{
    console.log("Requête reçu !");
    
    const data = request.body;

    await main.start(data.url).then((websiteData)=>{
        response.json({
            status:'success',
            message: 'Traitement finit',
            data : websiteData
        });
    })
    .catch((err)=>{
        return res.status(400).send({
            message: err.message
        })
    })

    console.log("Done");
});