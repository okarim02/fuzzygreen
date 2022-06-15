// Page analyse
async function analyse(){
    display_loading()
    let urls = reformate_url([document.getElementById("url_toAnalyse").value]);

    console.log("Url entrer : ",urls[0]);

    if (urls.length == 0) {
        show_error("Url invalide");
        console.log("Aucune url valide entrer...");
        return;
    }

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

        sessionStorage.setItem('url_data', JSON.stringify(data.url_data));
        sessionStorage.setItem('fuzzyData',JSON.stringify(data.fuzzyResult));

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

    console.log("urls reformat : ",urls);
    return urls;
}

// Page Initial
async function compute() {

    display_loading();

    let urls = reformate_url(document.getElementById("url-enter").value.split(/[\n\s,"]+/));

    if (urls.length == 0) {
        console.log("Aucune url valide entrer...");
        return;
    }

    console.log("Url(s) : ", urls);

    // Sauvegarde des critères pour plus tard ...
    sessionStorage.setItem('criteres', JSON.stringify(criteres_selected));

    const data = { urls, criteres_selected };
    // for more info : https://developer.mozilla.org/fr/docs/Web/API/Fetch_API/Using_Fetch
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    // endpoint
    await fetch('/api', options).then(async (res) => {
        //hide_loading();
        if (res.status == "failure") {
            console.error("Une erreur est survénu ...");
            //show_error(res.message);
            return;
        }
        console.log("Redirection : ",res.redirected)
        
        let x = await res.json();

       sessionStorage.setItem('computedData', x.data);

        if (x.redirected) {
            window.location.href = x.redirected;
        }
        
        hide_loading();
    }).catch((err) => {
        console.error("error ;( : ", err);
        show_error(err);
    });
}  