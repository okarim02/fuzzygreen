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

function format_data(data){
    // todo
}

function display_data(data) {
    var depot = document.getElementById('result')
    console.log(data);
    for (var prop in data) {
        if (Object.prototype.hasOwnProperty.call(data, prop)) {
            let ecoScore = document.createElement('h3');
            depot.appendChild(ecoScore);
            let newEl = document.createElement('div');
            depot.appendChild(newEl);

            if (prop == 'ecoIndex') {
                ecoScore.style.backgroundColor = 'green';
                ecoScore.textContent = prop + " => " + data[prop];
            }else if (prop == 'size') {
                newEl.style.fontSize = '15px';
                newEl.style.border = '1px solid black';
            }else if (["filesNotMin", "policesUtilise", "imagesWithoutLazyLoading"].includes(prop)) {
                newEl.innerText = prop + "=>";
                let conteneur = document.createElement('ul');
                newEl.appendChild(conteneur);
                data[prop].forEach(element => {
                    const li = document.createElement('li')
                    li.textContent = element + "\n"
                    conteneur.appendChild(li);
                });
                conteneur.style.background = 'white';
            } else if(prop == "host"){
                newEl.innerText = `${data[prop].isGreen ? "Hébergeur green !" :"Hébergeur non green !"} \n >>> Energie utilisé : ${data[prop].energy == "" ? '...' : data[prop].energy}`;
            } else {
                newEl.innerText = `${prop} : ${data[prop]}`;
            }
        }
    }
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
    
    urls = urls.filter(function (el) { // Delete empty string
        console.log("ayo : ",el);
        if(el == '' || !isUrl(el)){
            if(el!='')  console.error("Cette url est suspect :",el);
            return false;
        }
        return true;
    });


    if(urls.length)

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
        const x = await res.json();
        //display_data(x.data);
    
        console.log(data);
    }).catch((err) => {
        console.error(err);
        show_error(err);
    });
}