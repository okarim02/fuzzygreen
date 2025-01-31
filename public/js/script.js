function begin() {
    create_checkbox();
}

var more = JSON.parse(sessionStorage.getItem('more'));

// Catégorie: design, serveur, hébergement à faire
// Critères envoyé au serveur afin qu'ils les prennent en comptent.
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
    'host',// hébergement
    'ratioWhitePixels'
]

var criteres_selected = [...criteres];

deleteItem(criteres_selected,"isMobileFriendly");

var urls_scanned = [];

function deleteItem(array,item){
    var index = array.indexOf(item);
    if (index !== -1) {
        array[index] = "None";
    }
}

function create_checkbox() {
    const container = document.getElementById('checkbox_area');
    container.style = "background-color"
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
            var index = criteres.indexOf(ev.target.value);// Obtient l'index du critère 
            let index2 = criteres_selected.indexOf(ev.target.value); 
            if (index2 !== -1) { // Vérifie si le critère n'est pas séléctionner, sinon il est ajouté 
                criteres_selected[index] = "None";
            }else{
                criteres_selected[index] = criteres[index];
            }
        }
    }

}

function getHeaders(data) {
    return ["url", ...Object.keys(data[Object.keys(data)[0]])];// Loop pour chaque clé de la première données scanner.
}

// Affichage du tableau 
function display_data(data) {

    let depot = document.getElementById('result');

    let thead = document.createElement('thead');
    let tbl = document.createElement('table');

    tbl.style.width = '100%';
    tbl.style.border = '3px solid black';

    // ajout des groupes
    //thead.innerHTML+="<tr><th colspan='15'>Serveur</th><th colspan='8'>Design</th><th colspan='1'>hébergement</th></tr>"

    let headersRow = document.createElement('tr');
    let headers = getHeaders(data[0]);

    headers.forEach(text => {
        let header = document.createElement('th');
        let txt = document.createTextNode(text);
        header.setAttribute("class", "info");

        // Info-bulle
        header.addEventListener('mouseover',()=>{
            // Parcours le fichier criteres.json
            for(let i = 0 ; i < more.length;i++){
                if(more[i].header == text){ // Chaque critère affiché est identifiable par son header
                    header.setAttribute('data-content',`${more[i].critere} : ${more[i].description}`);
                }
            }
        })

        header.appendChild(txt);
        headersRow.appendChild(header);
    });

    thead.appendChild(headersRow);
    tbl.appendChild(thead);

    for (let i = 0; i < data.length; i++) { // Pour chaque site web 
        for (let key in data[i]) { // Pour chaque critère d'un site web
            let row = document.createElement('tr');

            // Cell for the url analyzed
            let cell = document.createElement('td');

            // URL
            let a = document.createElement('a');
            a.innerText = key;
            
            cell.appendChild(a);

            row.appendChild(cell);

            // i: index du site web
            // key : Critère du site i
            for (let val in data[i][key]) { // Pour chaque valeur des critères.
                let cell = document.createElement('td');
                cell.style.border = '1px solid black';
                let txt;
                var list_urls;
                
                if(data[i][key] == null) continue;

                if (typeof data[i][key][val] === 'object' && !Array.isArray(data[i][key][val]) && data[i][key][val] !== null) {
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
                    }else{ // Affichage des autres éléments comme la liste des fichiers javascript minimisé ou pixels blanc
                        txt = document.createElement('details');
                        txt.innerText = 'more'
                        list_urls = data[i][key][val].liste;
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
                        cell.appendChild(document.createTextNode('Nb : '+ data[i][key][val].nb));
                    }
                } else {
                    let v = data[i][key][val];
                    txt = document.createTextNode(isNaN(v)  ? '0' : v);
                }
                cell.appendChild(txt);
                
                row.appendChild(cell);
            }

            tbl.appendChild(row)
        }
    }
    depot.appendChild(tbl);
}
// Affiche des informations relative à la logique floue 
function display_fuzzy(data){

    console.log("fuzzy data : ",data);

    let depot = document.getElementById('fuzzyData');
    depot.innerHTML="";
    const title = document.createElement('h3');
    title.innerText = "Criteria intervals: ";
    depot.appendChild(title);
    
    let ul = document.createElement('ul');

    let criteres = Object.keys(data);

    for(let i = 0 ; i < criteres.length-1;i++){
        const li = document.createElement('li')
        li.textContent = `${criteres[i]}` + `=> min : ${ data[criteres[i]]['other'].min } ; max : ${ data[criteres[i]]['other'].max } ; average : ${ data[criteres[i]]['other'].moyenne } ; median : ${data[criteres[i]]['other'].median }`;
        ul.appendChild(li);
    }
    depot.appendChild(ul);

    // Affichage defuzzification
    let subtitle = document.createElement('h4');
    subtitle.innerText = `Defuzzification`;
    
    ul = document.createElement('ul');
    ul.innerHTML= `
        <li>
            excellent: ${data[criteres[criteres.length-1]][0]}
        </li>
        <li>
            Medium: ${data[criteres[criteres.length-1]][1]}
        </li>
        <li>
            Bad: ${data[criteres[criteres.length-1]][2]}
        </li>
    `
    depot.appendChild(subtitle);
    depot.appendChild(ul);

    
    subtitle = document.createElement('h5');
    subtitle.innerText = `Defuzzification (detail)`;

    ul = document.createElement('ul');

    // defuzzification de chaque variable linguistic
    for(let j = 0 ; j < criteres.length-1;j++){
        ul.innerHTML += `
            <li>
                ${criteres[j]} ====> ${data[criteres[j]]['fuzzification']}
                <button class="edit_fuzzy" type="button" onclick="location.href='result/modifyFuzzyRules/${criteres[j]}/'">
                    edit
                </button>
            `
        if(data[criteres[j]]['fuzzification'] == 'bad'){
            for(let i = 0 ; i < more.length;i++){
                if(more[i].header == criteres[j]){ // Chaque critère affiché est identifiable par son header
                    ul.innerHTML += ` <div style = "color:red"> Aide : ${more[i].conseil} </div>`;
                }
            }
        }
        ul.innerHTML += `</li>` 
    }
    depot.appendChild(subtitle);
    depot.appendChild(ul);
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
        [...getHeaders(data['urls_data'][0])], // header
    ];

    for(let i of data['urls_data']){
        let row = []; // Création de la ligne excel
        row.push(Object.keys(i)); // insertion url 

        for(let j of Object.values(i[Object.keys(i)])){ // Parcours des critères d'un url
            if(typeof j === 'object'){
                if(j.liste != undefined){
                    if(j.liste.length<3){
                        row.push(j.nb == 0 ? "0" : j.liste.toString()); // Si l'élément est un tableau alors on affiche sa taille 
                    }else{
                        // Afin de ne pas dépasser la limite de caractères pour une cellule excel, on n'affichera pas le contenu des tableaux mais leur taille.
                        row.push(j.nb);
                    }
                }
            }else{
                row.push(j.toString());
            }
        }
        wsData.push(row);
    }

    // Fuzzy data 
    // en-tête
    
    wsData.push([''])
    wsData.push([''])

    let criteres = Object.keys(data['fuzzy_data'])

    let entete_fuzzy = Object.keys(data['fuzzy_data'][criteres[0]]['other']);

    wsData.push(['Criteria',...entete_fuzzy,'result_fuzzy'])
    
    for(let i = 0 ; i < criteres.length-1;i++){
        let row = []; // Création de la ligne excel
        // insertion critere
        row.push(criteres[i]); 
        // Autres données : min,max, ecart ... 
        for (let j of Object.keys(data['fuzzy_data'][criteres[i]]['other'])){
            row.push(data['fuzzy_data'][criteres[i]]['other'][j]); 
        } 
        // Résultat fuzzy
        row.push(data['fuzzy_data'][criteres[i]]['fuzzification']); 
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

    display_data(computedData);
    display_data(url_data);
    display_fuzzy(fuzzyData);

    document.getElementById('fetch_result').style = "display : none;"
}

