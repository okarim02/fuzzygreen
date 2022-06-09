// Imports
const express = require('express');
const res = require('express/lib/response');
const app = express();

const main = require('./main');
const fuzzylogic = require('./fuzzyLogic');
const cluster = require('./cluster');
const tools = require('./tools');
const common = require('./common');
const PORT = process.env.PORT || 3000;
const routes = require("./routes/analyse");

app.use("/analyse",routes);

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
    res.render("partials/index.ejs");
})

app.get('/about',(req,res)=>{
    //res.send('about');
})

app.post('/api',async (request,response,next)=>{
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
<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
});
>>>>>>> Stashed changes

    console.log("Done");
    next();

<<<<<<< Updated upstream
});

app.listen(PORT, () => console.log(`Listening at ${PORT} (go to 'localhost:3000')`));
=======
=======

    console.log("Done");
    next();

<<<<<<< Updated upstream
});

app.listen(PORT, () => console.log(`Listening at ${PORT} (go to 'localhost:3000')`));
=======
>>>>>>> Stashed changes
// Après avoir entrer l'url, l'analyse de cette page en plus de la fuzzy logic se déclenche
// Puis le serveur redirigera une dernière fois l'utilisateur dans la page de résultat.
app.post("/getResult/analyse",async (req,res,next)=>{
    // analyser la page 
    const crits = req.body.criteres; // Dernier critères qu'on a sauvegarder
    const computed_data = req.body.computedData;
    const url_data = await clust(req.body.url,crits);

    // Appel fuzzy logic
    // todo : récuperer le résultat
    const fuzzyResult  = await fuzzylogic.launch(computed_data,url_data);

    res.json({
        status:'success',
        message: `Traitement terminé`,
        redirected: '/result',
        data : JSON.stringify({
            "fuzzyResult": fuzzyResult,
<<<<<<< Updated upstream
            "url_data":url_data 
        })
    });
})
=======
            "url_data":url_data
        })
    });
})
>>>>>>> Stashed changes
>>>>>>> Stashed changes
>>>>>>> Stashed changes


