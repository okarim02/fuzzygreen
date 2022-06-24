var fuzzyData = JSON.parse(sessionStorage.getItem('fuzzyData')); 
var critere = "";
var membership = [];

function init(){
    const url = window.location.href.split('/');
    critere = url[url.length-2];
    membership = Object.keys(fuzzyData[critere].membership_function);
}

function init_fuzzy(){
    init()
    console.log("critère : ",critere);
    for(let i = 1 ; i<=3 ;i++){
        let liste = document.getElementById('fig_'+i);
        let options = liste.options;
        let fig = fuzzyData[critere].membership_function[membership[i-1]]['figure']
        if(options[0].value == fig){
            options[0].selected = true;
        }else{
            options[1].selected = true;
            
        }
        liste.addEventListener('change', function() {
            if(liste.options[liste.selectedIndex] == options[1]){
                document.getElementById(`x${3}_id${i}`).removeAttribute('disabled');
            }else{
                document.getElementById(`x${3}_id${i}`).setAttribute('disabled','');
            }
        })
        for(let j = 0 ; j <= 3 ;j++){
            let x = document.getElementById(`x${j}_id${i}`);
            x.value = fuzzyData[critere].membership_function[membership[i-1]][`x${j}`];
        }
    }
}

async function confirm(){
    // Prélévement des nouvelles données.
    let membership_functions_result = {
        "criteria":"PageSize(Ko)",
        "excellent":{},
        "medium":{},
        "bad":{},
    }
    for(let i = 1 ; i<=3 ;i++){
        let fig = membership[i-1];

        let liste = document.getElementById('fig_'+i);
        
        var selectedValue = liste.options[liste.selectedIndex].value;
       
        membership_functions_result[fig]["figure"]= selectedValue;

        for(let j = 0 ; j <= 3 ;j++){
            let x = document.getElementById(`x${j}_id${i}`);
            membership_functions_result[fig][`x${j}`] = x.value;
        }

    }

    let data = 
    { 
        "fuzzyData": JSON.parse(sessionStorage.getItem('fuzzyData')),
        "membership_functions_result":membership_functions_result
    };

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