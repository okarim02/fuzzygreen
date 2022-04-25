const express = require('express');
const app = express();
const main = require('./main');

app.listen(3000, () => console.log("Listening at 3000 (go to 'localhost:3000')"));
app.use(express.static(__dirname+'/public'));

// Same as bodyParser
// http://expressjs.com/fr/api.html#express.json
app.use(express.json({
    limit: '1mb'
}));

app.post('/api',async (request,response)=>{
    console.log("Requête reçu !");
    
    const data = request.body;

    const websiteData = await main.start(data.url);
    console.log("Done");

    response.json({
        status:'success',
        message: 'Traitement finit',
        data : websiteData
    });

});