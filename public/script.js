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
    "ecoIndex"
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
    let el = document.getElementById('result');
    el.innerText = message;
    window.setTimeout(hide_loading, 3500);
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