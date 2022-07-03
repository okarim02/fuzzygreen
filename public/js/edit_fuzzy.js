var fuzzyData = JSON.parse(sessionStorage.getItem('fuzzyData')); 
var critere = "";
var membership = ['excellent','medium','bad']; // Liste de la forme : 

function init(){
    const url = window.location.href.split('/');
    critere = url[url.length-2];
}

function init_fuzzy(){
    init()
    console.log("critère : ",critere);
    console.log("Fuzzy logic : ",fuzzyData);

    // Attribution

    let liste = document.getElementById('fig_1');

    for(let i = 1 ; i<=3 ;i++){
        console.log(fuzzyData[critere].membership_function[membership[i]])
        let liste = document.getElementById('fig_'+i); // i = 1 => excellent ; i= 2 => Medium ; i=3 =>bad
        let options = liste.options;
        let fig = fuzzyData[critere].membership_function[membership[i-1]]['figure']

        console.log(fuzzyData[critere].membership_function[membership[i-1]])

        if(options[0].value == fig){
            options[0].selected = true;
            document.getElementById(`x${3}_id${i}`).setAttribute('disabled','');
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
            x.value = fuzzyData[critere].membership_function[membership[i-1]][`x${j}`] || '0';
        }
    }
}

async function confirm(){
    // Prélévement des nouvelles données.
    let membership_functions_result = {
        "criteria":critere,
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

    edit_fuzzy_call(data);
}