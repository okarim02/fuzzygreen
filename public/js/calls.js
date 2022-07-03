
async function edit_fuzzy_call(data){
    // Redirection + envoie des nouvelles données au serveur.
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    await fetch('/result/modifyFuzzyRules/', options).then(async (res) => {
        //hide_loading();
        if (res.status == "failure") {
            console.error("Une erreur est survénu ...");
            //show_error(res.message);
            return;
        }
        let x = await res.json();
        let data = JSON.parse(x.data);

        sessionStorage.setItem('fuzzyData',JSON.stringify(data.fuzzyResult));

        
        if (x.redirected) {
            window.location.href = x.redirected;
        }

        hide_loading();
    }).catch((err) => {
        console.error("error ;( : ", err);
    });
}

// Fonctions qui font les appels API au serveur.
async function analyse(){
    let urls = reformate_url([document.getElementById("url_toAnalyse").value]);

    console.log("Url entrer : ",urls[0]);

    if (urls.length == 0) {
        show_error("Url invalide");
        console.log("Aucune url valide entrer...");
        return;
    }

    display_loading()

    const computedData = JSON.parse(sessionStorage.getItem('computedData'));
    const crits = JSON.parse(sessionStorage.getItem('criteres'));
    
    const data = { 
        "url":urls, 
        "computedData":computedData , 
        "criteres":crits 
    }

    console.log("Lancement de l'analyse");

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    // endpoint
    await fetch('/getResult/analyse', options).then(async (res) => {
        //hide_loading();
        if (res.status == "failure") {
            console.error("Une erreur est survénu ...");
            //show_error(res.message);
            return;
        }
        console.log("Retour serveur");
        let x = await res.json();
        let data = JSON.parse(x.data);

        sessionStorage.setItem('url_data', JSON.stringify(data.url_data)); // Résultat de l'url analysé
        sessionStorage.setItem('fuzzyData',JSON.stringify(data.fuzzyResult)); // Résultat de la logique floue 
        sessionStorage.setItem('more',JSON.stringify(data.more)); // Ensemble des informations utile comme : la description d'un critère, conseil etc ... 

        if (x.redirected) {
            window.location.href = x.redirected;
        }
        hide_loading();
    }).catch((err) => {
        console.error("error ;( : ", err);
    });
    
}

function reformate_url(array){
    let urls = [...array]
    for(let i = 0 ;  i< urls.length ;i++){
        if(urls[i].indexOf("http://") <0 && urls[i].indexOf("https://")<0){
            if(urls[i].indexOf("www") < 0){
                urls[i]="http://www."+urls[i];
            }else{
                urls[i]="http://"+urls[i];
            }
        }   
        if (!isUrl(urls[i]) || urls[i] == 'http://www.') {
            show_error("Url incomplet : "+urls[i]);
            urls[i]="";
        }
    }
    urls = urls.filter(function(el){
        return el!="";
    });
    return urls;
}

// Page Initial, fonction appelé lorsque l'utilisateur appuie sur 'scan'
async function compute() {

    let urls = reformate_url(document.getElementById("url-enter").value.split(/[\n\s,"]+/));

    if (urls.length == 0) {
        console.log("Aucune url valide entrer...");
        return;
    }

    console.log("Url(s) : ", urls);

    display_loading();

    // Sauvegarde les critères de la liste de checkbox pour plus tard ...
    sessionStorage.setItem('criteres', JSON.stringify(criteres_selected));

    const data = { urls, criteres_selected };
    // pour plus d'info : https://developer.mozilla.org/fr/docs/Web/API/Fetch_API/Using_Fetch
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    // endpoint
    // fetch() timeouts at 300 seconds in Chrome
    // todo : faire ca : https://dmitripavlutin.com/timeout-fetch-request/
    await fetch('/api', options).then(async (res) => {
        //hide_loading();
        if (res.status == "failure") {
            console.error("Une erreur est survénu ...");
            show_error(res.message);
            return;
        }
        
        let x = await res.json();

        console.log("Data reçu : ",x.data)

        if(typeof x.data != 'undefined'){
            // Sauvegarde des données dans le cache de l'utilisateur => Pas besoin de BDD comme ça :)
            sessionStorage.setItem('computedData', x.data);
        }else{
            show_error("Le serveur n'a envoyé aucune donnée ... ");
        }

       // Redirection
       // Commentaire : La redirection depuis le serveur ne marche pas pour une certaine raison... 
        if (x.redirected) {
            window.location.href = x.redirected;
        }
        hide_loading();
    
    }).catch((err) => {
        console.error("error ;( : ", err);
        show_error(err);
    });
}  