function begin() {
    console.log("Hello this is the function test !");

    create_checkbox();
}
// Catégorie: design, serveur, hébergement
var criteres = [
    'PageSize(Ko)', // Serveur
    'RequestsNb',
    'DOMsize(nb elem)',
    'JSMinification', 
    'CSSMinification',
    'etagsRatio',
    'etagsNb',
    'lazyLoadRatio',
    'filesWithError',
    'CSSNotExt',
    'JSNotExt',
    'isStatic',
    'Http1.1/Http2requests ',
    'pluginsNb',
    'FontsNb', // design
    'imagesWithoutLazyLoading',
    'cssFiles',
    'socialButtons',
    'CMS',
    'imgResize',
    'isMobileFriendly',
    'imgSrcEmpty',
    'host'// hébergement
]

var criteres_selected = [...criteres];

deleteItem(criteres_selected,"isMobileFriendly");

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
        if (!['isMobileFriendly'].includes(criteres[i])) {
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
            let index2 = criteres_selected.indexOf(ev.target.value);
            if (index2 !== -1) {
                criteres_selected.splice(index, 1);
            }else{
                criteres_selected.push(ev.target.value);
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
    return ["url", ...Object.keys(data[Object.keys(data)[0]])];// Loop pour chaque clé de la première données scanner.
}

// Affichage du tableau 
function display_data(data) {

    console.log("DATA : ",data);

    let depot = document.getElementById('result');

    let thead = document.createElement('thead');
    let tbl = document.createElement('table');

    tbl.style.width = '100%';
    tbl.style.border = '3px solid black';

    // ajout des groupes
    thead.innerHTML+="<tr><th colspan='15'>Serveur</th><th colspan='8'>Design</th><th colspan='1'>hébergement</th></tr>"

    let headersRow = document.createElement('tr');
    let headers = getHeaders(data[0]);

    headers.forEach(text => {
        let header = document.createElement('th');
        let txt = document.createTextNode(text);
        header.appendChild(txt);
        headersRow.appendChild(header);
    });

    thead.appendChild(headersRow);
    tbl.appendChild(thead);

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
                var list_urls;
                if (["CMS","JSMinification","CSSMinification", "FontsNb", "imagesWithoutLazyLoading", "filesWithError","socialButtons"].includes(val)) {
                    txt = document.createElement('details');
                    txt.innerText = 'more'
                    list_urls = data[i][key][val];
                    let ul = document.createElement('ul');
                    for (let element in list_urls) {
                        const li = document.createElement('li')
                        if(!["FontsNb"].includes(val)){ // Don't need balise 'a' for download fonts
                            let a_b = document.createElement('a');
                            a_b.setAttribute('href',list_urls[element]);
                            a_b.textContent = list_urls[element] + " \n ";
                            ul.append(a_b);
                        }else{
                            li.textContent = list_urls[element] + "\n"
                            ul.appendChild(li);
                        }
                    }
                    ul.style.background = 'white';
                    txt.appendChild(ul);
                    cell.appendChild(document.createTextNode('Nb : '+ (list_urls.length == undefined ? 0 : list_urls.length)));

                } else {
                    // In case of the green host data
                    if (val === 'host') {
                        // Création d'une nouvelle ligne pour séparer les groupes (voir structure d'un tableau)
                        let host_data = data[i][key][val]
                        txt = document.createElement("div");
                        txt.innerHTML = `<ul>
                        <li>${host_data.isGreen ? "1":"0"} </li>
                        <li> Energie utilisé : ${host_data.energy != "" ? host_data.energy : "NaN"}  </li>
                        <li> co2 info (api : greenfoundation) : ${JSON.stringify(host_data.co2_info_greenfoundation)}</li>
                        <li> co2 (2) info (api : co2 signal) : ${JSON.stringify(host_data.co2_info_elec_map)} </li>
                        <li> Pays : ${host_data.country} </li>
                        </ul>
                        `
                        ;
                    } else if(val === "isMobileFriendly"){
                        txt = document.createTextNode(`${data[i][key][val] ? "1":"0"}`);
                    }else{
                        let v = data[i][key][val];
                        txt = document.createTextNode(isNaN(v)  ? '0' : v);
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
    const title = document.createElement('h3');
    title.innerText = "Fuzzy logic : ";
    depot.appendChild(title);
    
    let ul = document.createElement('ul');
    
    for(let i of Object.keys(data)){
        const li = document.createElement('li')
        li.textContent = `${i} : {excellent : ${ data[i][0] } , Medium : ${ data[i][1] } , Bad : ${ data[i][2] }}`;
        ul.appendChild(li);
    }
    depot.appendChild(ul);
}

function display_loading() {
    let el = document.getElementById('loading');
    el.classList.add("display");
}

function hide_loading() {
    let el = document.getElementById('loading');
    el.classList.remove("display");
}

function show_error(message) {
    let el = document.getElementById('loading');
    alert(message);
}

// Voir http://jsfiddle.net/hybrid13i/JXrwM/;
function generate_save_button(data){
    let depot = document.getElementById('result');
    const button = document.createElement('button')
    button.innerText = 'Télécharger résultat'
    button.addEventListener('click', () => {
        generateExcel(data);
      })
    depot.appendChild(button);
}

function generateExcel(data){
    let wb = XLSX.utils.book_new();
    wb.Props = {
        Title: 'data_fuzzyGreen',
        Subject: 'result',
        Author: 'FuzzyGreen',
        CreatedDate: new Date(),
    };
    let wsName = 'newSheet';

    let wsData = [
        [...getHeaders(data[0])], // header
    ];

    for(let i of data){
        let row = [];
        row.push(Object.keys(i));

        for(let j of Object.values(i[Object.keys(i)])){
            if(Array.isArray(j)){
                if(j.length<3){
                    row.push(j.toString().length == 0 ? "0" : j.toString);
                }else{
                    // Afin de ne pas dépasser la limite de caractères pour une cellule excel, on n'affichera pas le contenu des tableaux mais leur taille.
                    row.push(j.length);
                }
                
            }else{
                if(typeof j === 'object'){
                    row.push(JSON.stringify(j));
                }else{
                    row.push(j.toString());
                }
            }
        }
        wsData.push(row);
    }

    let ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, wsName);

    XLSX.writeFile(wb, 'result_fuzzyGreen.xlsx');
}

// affiche les données calculé jusqu'a ici
async function resultats(){
    
    const computedData = JSON.parse(sessionStorage.getItem('computedData'));
    const url_data = JSON.parse(sessionStorage.getItem('url_data'));
    const fuzzyData = JSON.parse(sessionStorage.getItem('fuzzyData'));

    // Modif pour faciliter la conversion json en csv
    computedData.push(url_data[0]);

    generate_save_button(computedData);

    display_data(computedData);
    display_data(url_data);
    display_fuzzy(fuzzyData);
}

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