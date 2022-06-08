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

var criteres_selected = criteres;
var urls_scanned = [];

function create_checkbox(){
    const container = document.getElementById('checkbox_area');
    for(let i = 0 ;i < criteres.length ;i++){
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'criteria';
        checkbox.name = criteres[i];
        checkbox.value = criteres[i];
        checkbox.checked = true;
     
        let label = document.createElement('label')
        label.htmlFor = 'critere';
        label.appendChild(document.createTextNode(criteres[i]));
     
        var br = document.createElement('br');

        container.appendChild(checkbox);
        container.appendChild(label);
        container.appendChild(br);
    }
    container.onclick = function(ev) {
        if(ev.target.value) {
           // criteres_selected.slice()
            var index = criteres.indexOf(ev.target.value);
            if (index !== -1) {
                criteres_selected.splice(index, 1);
            }
        }
    }
   
}

function decide(){
    const container = document.getElementById('choice');
    let search = document.getElementById('anaylse_url');
    search.placeholder="Entrer l'url que vous souhaiter analyser !"
    search.disabled = false;
    let button = document.getElementById("submit2");
    button.disabled=false;
    
    button.addEventListener("click",exec);
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

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Affichage du tableau 
=======
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
function display_data(data) {
=======
// Affichage du tableau 

function display_data(data,data2) {
>>>>>>> Stashed changes
<<<<<<< Updated upstream

<<<<<<< Updated upstream
=======
    console.log("DATA : ",data);
=======
>>>>>>> Stashed changes

>>>>>>> Stashed changes
    let depot = document.getElementById('result');
    let tbl = document.createElement('table');

    tbl.style.width = '100%';
    tbl.style.border = '3px solid black';

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
<<<<<<< Updated upstream
    // ajout des groupes
    thead.innerHTML+="<tr><th colspan='15'>Serveur</th><th colspan='8'>Design</th><th colspan='1'>hébergement</th></tr>"
=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
=======
    // ajout des groupes
    thead.innerHTML+="<tr><th colspan='15'>Serveur</th><th colspan='8'>Design</th><th colspan='1'>hébergement</th></tr>" // catégories

>>>>>>> Stashed changes
    let headersRow = document.createElement('tr');
>>>>>>> Stashed changes

>>>>>>> Stashed changes
    let headersRow = document.createElement('tr');

    let headers = getHeaders(data[0]);

    headers.forEach(text => { // création titre de colonne
        let header = document.createElement('th');
        let txt = document.createTextNode(text);
        header.appendChild(txt);
        headersRow.appendChild(header);
    });

    tbl.appendChild(headersRow);

    // création des lignes du tableau
    for (let i = 0; i < data.length; i++) {
        for (let key in data[i]) {
            let row = document.createElement('tr');

            // Cellule 
            let cell = document.createElement('td');
            cell.style.border = '3px solid black';

            let a = document.createElement('a');
            a.innerText = key;
            cell.appendChild(a);
            row.appendChild(cell);

            // Loop pour chaque valeur des critères d'un URL 
            for (let val in data[i][key]) {
                let cell = document.createElement('td');
                cell.style.border = '1px solid black';
                let txt;
<<<<<<< Updated upstream

                if (["filesNotMin", "policesUtilise", "imagesWithoutLazyLoading", "cssFiles", "filesWithError"].includes(val)) {
=======
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                var list_urls;
                if (["CMS","JSMinification","CSSMinification", "FontsNb", "imagesWithoutLazyLoading", "filesWithError","socialButtons"].includes(val)) {
=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes

                if (["filesNotMin", "policesUtilise", "imagesWithoutLazyLoading", "cssFiles", "filesWithError"].includes(val)) {
=======
                var list_urls;
                if (["CMS","JSMinification","CSSMinification", "FontsNb", "imagesWithoutLazyLoading", "filesWithError","socialButtons"].includes(val)) { // Si le critère possède en valeur une liste.
>>>>>>> Stashed changes
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
                    txt = document.createElement('details');
                    const list_urls = data[i][key][val];
                    let ul = document.createElement('ul');
                    for (let element in list_urls) {
                        const li = document.createElement('li')
<<<<<<< Updated upstream
                        li.textContent = list_urls[element] + "\n"
                        ul.appendChild(li);
                    }
                    ul.style.background = 'white';
                    txt.appendChild(ul);
=======
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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

=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
                        li.textContent = list_urls[element] + "\n"
                        ul.appendChild(li);
                    }
                    ul.style.background = 'white';
                    txt.appendChild(ul);
=======
                        if(!["FontsNb"].includes(val)){ // Pas besoin de liens pour le critère : fonts
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

                    // Info complémentaire
                    cell.appendChild(document.createTextNode('Nb : '+ (list_urls.length == undefined ? 0 : list_urls.length)));
>>>>>>> Stashed changes
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
                } else {
                    // Affichage précis des valeurs si le critère est 'host'
                    if (val === 'host') {
<<<<<<< Updated upstream
                        txt = document.createTextNode(JSON.stringify(data[i][key][val]));
                    } else {
                        txt = document.createTextNode(data[i][key][val]);
=======
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
                        txt = document.createTextNode(JSON.stringify(data[i][key][val]));
                    } else {
                        txt = document.createTextNode(data[i][key][val]);
=======
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                    } else if(val === "isMobileFriendly"){
=======
                    } else if(val === "isMobileFriendly"){ 
>>>>>>> Stashed changes
=======
                    } else if(val === "isMobileFriendly"){ 
>>>>>>> Stashed changes
                        txt = document.createTextNode(`${data[i][key][val] ? "1":"0"}`);
                    }else{
                        let v = data[i][key][val];
                        txt = document.createTextNode(isNaN(v)  ? '0' : v);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
>>>>>>> Stashed changes
                    }
                }

                cell.appendChild(txt);
<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
<<<<<<< Updated upstream

                
=======
<<<<<<< Updated upstream
=======
                
>>>>>>> Stashed changes
>>>>>>> Stashed changes
=======
=======
                
>>>>>>> Stashed changes
>>>>>>> Stashed changes
>>>>>>> Stashed changes
                row.appendChild(cell);
            }

            tbl.appendChild(row)
        }
    }

    // Affichage min max average median  
    // Ces valeurs ont été calculé lors de la phase : fuzzy _ logic et récupérabe depuis la valeur : fuzzyData.

    criteres_analyse =  Object.keys(data2);
    headers_infos = ['min','max','average','median']

    for(let i = 0 ; i < criteres_analyse.length;i++){
        let row = `<tr>
            <td> ${ headers_infos[i] } </td>
            <td>
                ${data2[criteres_analyse[i]].other.min}
            </td>
        </tr>`


        tbl.innerHTML += row;

    }
    depot.appendChild(tbl);
    decide();
}

function display_loading() {
    let el = document.getElementById('result');
    el.innerText = "Loading ...";
}

function hide_loading() {
    let el = document.getElementById('result');
    el.innerText = "";
}

function show_error(message) {
<<<<<<< Updated upstream
    let el = document.getElementById('result');
    el.innerText = message;
    window.setTimeout(hide_loading, 3500);
=======
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
    let el = document.getElementById('result');
    el.innerText = message;
    window.setTimeout(hide_loading, 3500);
=======
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    let el = document.getElementById('loading');
    alert(message);
}

// Voir http://jsfiddle.net/hybrid13i/JXrwM/;
function generate_save_button(data){
    console.log("generet ! ", data);
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
        [...getHeaders(data['urls_data'][0])], // header
    ];

    for(let i of data['urls_data']){
        let row = []; // Création de la ligne excel
        row.push(Object.keys(i)); // insertion url 

        for(let j of Object.values(i[Object.keys(i)])){
            if(Array.isArray(j)){
                if(j.length<3){
                    row.push(j.length == 0 ? "0" : j.toString()); // Si l'élément est un tableau alors on affiche sa taille 
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

    // Fuzzy data 
    // en-tête
    
    wsData.push([''])
    wsData.push(['Fuzzy logic'])
    wsData.push([''])
    let criteres = Object.keys(data['fuzzy_data'])

    let entete_fuzzy = Object.keys(data['fuzzy_data'][criteres[0]]['other']);

    wsData.push(['Criteria',...entete_fuzzy])
    
    for(let i of criteres){
        let row = []
        row.push(i); // critère analyse
        row.push(data['fuzzy_data'][i]['other'].min)
        row.push(data['fuzzy_data'][i]['other'].max)
        row.push(data['fuzzy_data'][i]['other'].moyenne)
        row.push(data['fuzzy_data'][i]['other'].median)
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

    generate_save_button({"urls_data":computedData,"fuzzy_data":fuzzyData});

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    display_data(computedData);
=======
    display_data(computedData,fuzzyData);
>>>>>>> Stashed changes
=======
    display_data(computedData,fuzzyData);
>>>>>>> Stashed changes
    display_data(url_data);
    display_fuzzy(fuzzyData);

    document.getElementById('fetch_result').style = "display : none;"
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
>>>>>>> Stashed changes
}


async function exec() {
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

    display_loading();

    const data = { urls,criteres_selected };
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
        hide_loading();
        if (res.status == "failure") {
            console.error("Une erreur est survénu ...");
            show_error(res.message);
            return;
        }
        let x = await res.json();
        console.log("Message :", x.message);
        display_data(JSON.parse(x.data));
    }).catch((err) => {
        console.error("error ;( : ", err);
        show_error(err);
    });
}