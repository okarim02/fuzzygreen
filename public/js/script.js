function begin() {
    console.log("Hello this is the function test !");
    create_checkbox();
}

var criteres = ["nbRequest",
    "size",
    "domSize",
    "JSHeapUsedSize",
    "filesNotMin",
    "policesUtilise",
    "etagsNb",
    "imagesWithoutLazyLoading",
    "cssFiles",
    "cssOrJsNotExt",
    "filesWithError",
    "socialButtonsFound",
    "nbOfImagesWithSrcEmpty",
    "isStatic",
    "poweredBy",
    "protocolHTTP",
    "cms",
    "loadTime",
    "ratioLazyLoad",
    "ratioimagesResizedInPage",
    "ratioHttp1",
    "plugins",
    "ratio_etags",
    "host",
    "ecoIndex",
    "mobileFriendly"
]

var criteres_selected = [...criteres];

deleteItem(criteres_selected,"mobileFriendly");
deleteItem(criteres_selected,"host");

var urls_scanned = [];

function deleteItem(array,item){
    var index = array.indexOf(item);
    if (index !== -1) {
        array.splice(index, 1);
    }
}
// Do a table (flou, non flou (boolean))
function create_checkbox() {
    const container = document.getElementById('checkbox_area');
    for (let i = 0; i < criteres.length; i++) {
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'criteria';
        checkbox.name = criteres[i];
        checkbox.value = criteres[i];

        // Exclude
        if (!['host','mobileFriendly'].includes(criteres[i])) {
            checkbox.defaultChecked = true;
        }

        let label = document.createElement('label')
        label.htmlFor = 'critere';
        label.appendChild(document.createTextNode(criteres[i] + ", c" + (i + 1)));

        var br = document.createElement('br');

        container.appendChild(checkbox);
        container.appendChild(label);
        container.appendChild(br);
    }
    container.onclick = function (ev) {
        if (ev.target.value) {
            // criteres_selected.slice()
            var index = criteres.indexOf(ev.target.value);
            if (index !== -1) {
                criteres_selected.splice(index, 1);
            }
        }
    }

}

function isUrl(string) {
    let url_string;
    try {
        url_string = new URL(string);
    } catch (_) {
        return false;
    }
    return url_string.protocol === "http:" || url_string.protocol === "https:";
}

function getHeaders(data) {
    return ["url", ...Object.keys(data[Object.keys(data)[0]])];// Loop for each proprieties .
}

function display_data(data) {

    let depot = document.getElementById('result');

    let tbl = document.createElement('table');

    tbl.style.width = '100%';
    tbl.style.border = '3px solid black';

    let headersRow = document.createElement('tr');

    let headers = getHeaders(data[0]);

    headers.forEach(text => {
        let header = document.createElement('th');
        let txt = document.createTextNode(text);
        header.appendChild(txt);
        headersRow.appendChild(header);
    });

    tbl.appendChild(headersRow);

    for (let i = 0; i < data.length; i++) {
        for (let key in data[i]) {
            let row = document.createElement('tr');

            // Cell for the url analyzed
            let cell = document.createElement('td');
            cell.style.border = '3px solid black';

            let a = document.createElement('a');
            a.innerText = key;
            cell.appendChild(a);
            row.appendChild(cell);

            // Loop for each values link to the url
            for (let val in data[i][key]) {
                let cell = document.createElement('td');
                cell.style.border = '1px solid black';
                let txt;

                if (["filesNotMin", "policesUtilise", "imagesWithoutLazyLoading", "cssFiles", "filesWithError"].includes(val)) {
                    txt = document.createElement('details');
                    const list_urls = data[i][key][val];
                    let ul = document.createElement('ul');
                    for (let element in list_urls) {
                        const li = document.createElement('li')
                        li.textContent = list_urls[element] + "\n"
                        ul.appendChild(li);
                    }
                    ul.style.background = 'white';
                    txt.appendChild(ul);
                } else {
                    // In case of the green host data
                    if (val === 'host') {
                        txt = document.createTextNode(JSON.stringify(data[i][key][val]));
                    } else {
                        txt = document.createTextNode(data[i][key][val]);
                    }
                }

                cell.appendChild(txt);
                row.appendChild(cell);
            }

            tbl.appendChild(row)
        }
    }

    depot.appendChild(tbl);
}
function display_fuzzy(data){
    let depot = document.getElementById('fuzzyData');
    depot.innerHTML="";
    
    let ul = document.createElement('ul');
    
    for(let i of Object.keys(data)){
        const li = document.createElement('li')
        li.textContent = `${i} : {excellent : ${ data[i][0] } , Medium : ${ data[i][1] } , Bad : ${ data[i][2] }}`;
        ul.appendChild(li);
    }
    depot.appendChild(ul);
}
/*
function display_loading() {
    let el = document.getElementById('result');
    el.innerText = "Loading ...";
}

function hide_loading() {
    let el = document.getElementById('result');
    el.innerText = "";
}

function show_error(message) {
    let el = document.getElementById('result');
    el.innerText = message;
    window.setTimeout(hide_loading, 3500);
}*/

// affiche les données calculé jusqu'a ici
async function resultats(){
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    }
    await fetch('/getData', options).then(async (res) => {
        //hide_loading();
        if (res.status == "failure") {
            console.error("Une erreur est survénu ...");
            //show_error(res.message);
            return;
        }
        let x = await res.json();
        console.log("Message :", x.message);

        document.getElementById('result').innerHTML="";

        const content = JSON.parse(x.data);
        for(let i of Object.keys(content)){
            if(i=="fuzzyData"){
                console.log("fuzzy : ",content[i]);
                display_fuzzy(content[i]);
            }else{
                display_data(content[i]);
            }
            console.log(i)
        }
    }).catch((err) => {
        console.error("error ;( : ", err);
    });
}

async function analyse(){
    let url = document.getElementById("url_toAnalyse").value.split(/[\n\s,"]+/);
    if(!isUrl(url)){ 
        console.error("Veuillez entrer une url valide");
        return ;
    }
    const data = { url }

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
        if (x.redirected) {
            window.location.href = x.redirected;
        }
    }).catch((err) => {
        console.error("error ;( : ", err);
    });
    
}


async function compute() {
    let urls = document.getElementById("url-enter").value.split(/[\n\s,"]+/);

    urls = urls.filter(function (el) { // Delete empty string and sus url.
        if (el == '' || !isUrl(el)) {
            if (el != '') console.error("Cette url est suspect :", el);
            return false;
        }
        return true;
    });

    if (urls.length == 0) {
        console.log("Aucune url valide entrer...");
        return;
    }

    console.log("Url(s) : ", urls);

    //display_loading();

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
        if (x.redirected) {
            window.location.href = x.redirected;
        }
        
        /*
        console.log("Message :", x.message);
        display_data(JSON.parse(x.data));
        */
    }).catch((err) => {
        console.error("error ;( : ", err);
        //show_error(err);
    });
}