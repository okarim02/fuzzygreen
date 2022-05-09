function test() {
    console.log("Hello this is the function test !");
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

function getHeaders(data){
    return ["url",...Object.keys(data[Object.keys(data)[0]])];// Loop for each proprieties .
}

function display_data(data) {

    let depot = document.getElementById('result');
    let tbl = document.createElement('table');
    
    tbl.style.width = '100%';
    tbl.style.border = '3px solid black';

    let headersRow = document.createElement('tr');
    
    let headers =  getHeaders(data);

    headers.forEach(text=>{
        let header = document.createElement('th');
        let txt = document.createTextNode(text);
        header.appendChild(txt);
        headersRow.appendChild(header);
    })

    tbl.appendChild(headersRow);

    for(let key in data){
        let row = document.createElement('tr');
        
        // Cell for the url analyzed
        let cell = document.createElement('td');
        cell.style.border = '3px solid black';

        let a = document.createElement('a');
        a.innerText=key;
        cell.appendChild(a);
        row.appendChild(cell);

        // Loop for each values link to the url
        for(let val in data[key]){
            let cell = document.createElement('td');
            cell.style.border = '1px solid black';
            let txt;

            if(["filesNotMin","policesUtilise","imagesWithoutLazyLoading","cssFiles","filesWithError"].includes(val)){
                txt = document.createElement('details');
                const list_urls = data[key][val];
                let ul = document.createElement('ul');
                for(let element in list_urls){
                    const li = document.createElement('li')
                    li.textContent = list_urls[element] + "\n"
                    ul.appendChild(li);
                }
                ul.style.background = 'white';
                txt.appendChild(ul);
            }else{
                console.log("key analysed : ",key);
                console.log("Val : ",val);
                console.log("value of val :", data[key][val]);
                txt = document.createTextNode(data[key][val])
            }
            
            cell.appendChild(txt);
            row.appendChild(cell);
        }

        tbl.appendChild(row)
    }

    // data.forEach(e => {
    //     let row = document.createElement('tr');

    //     Object.values(e).forEach(f=>{
    //         let cell = document.createElement('td');
    //         let txt = document.createTextNode(f);
    //         cell.appendChild(txt);
    //         row.appendChild(cell);
    //     });
    //     tbl.appendChild(row)
    // });


    depot.appendChild(tbl);

    // for (var prop in data) {
    //     if (Object.prototype.hasOwnProperty.call(data, prop)) {
    //         let ecoScore = document.createElement('h3');
    //         depot.appendChild(ecoScore);
    //         let newEl = document.createElement('div');
    //         depot.appendChild(newEl);

    //         if (prop == 'ecoIndex') {
    //             ecoScore.style.backgroundColor = 'green';
    //             ecoScore.textContent = prop + " => " + data[prop];
    //         }else if (prop == 'size') {
    //             newEl.style.fontSize = '15px';
    //             newEl.style.border = '1px solid black';
    //         }else if (["filesNotMin", "policesUtilise", "imagesWithoutLazyLoading"].includes(prop)) {
    //             newEl.innerText = prop + "=>";
    //             let conteneur = document.createElement('ul');
    //             newEl.appendChild(conteneur);
    //             data[prop].forEach(element => {
    //                 const li = document.createElement('li')
    //                 li.textContent = element + "\n"
    //                 conteneur.appendChild(li);
    //             });
    //             conteneur.style.background = 'white';
    //         } else if(prop == "host"){
    //             newEl.innerText = `${data[prop].isGreen ? "Hébergeur green !" :"Hébergeur non green !"} \n >>> Energie utilisé : ${data[prop].energy == "" ? '...' : data[prop].energy}`;
    //         } else {
    //             newEl.innerText = `${prop} : ${data[prop]}`;
    //         }
    //     }
    // }
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
        if(el == '' || !isUrl(el)){
            if(el!='')  console.error("Cette url est suspect :",el);
            return false;
        }
        return true;
    });

    if(urls.length==0){
        console.log("Aucune url valide entrer...");
        return;
    }

    console.log("Url(s) : ",urls);

    display_loading();

    const data = { urls };
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
        if(res.status == "failure"){
            console.error("Une erreur est survénu ...");
            show_error(res.message);
            return ;
        }
        let x = await res.json();
        console.log("Message :",x.message);

        display_data(x.data);
    }).catch((err) => {
        console.error("error ;( : ",err);
        show_error(err);
    });
}