const fuzzylogic = require('fuzzylogic');
const common = require('./common');

/*
    Linguistic terms for now : excellant, medium, bad. 
*/

function average(array){
    let sum = 0 ;
    for(let i = 0 ; i < array.length;i++){ 
        sum+=array[i];
    }
    return sum/array.length;
}

function getMinMax(array){
    return [Math.min(...array),Math.max(...array)];
}

function getEcart(values,moyenne){
    let sum = 0 ;
    for(let i of values){
        sum+= Math.pow((i-moyenne),2);
    }
    return Math.sqrt(sum/values.length);
}

function getSpecificData(data,critere){
 
    let valuesData = []
    data.map((obj)=>{
        Object.values(obj).forEach(e=>{
            valuesData.push(e[critere])
        })
    })
    valuesData = valuesData.filter((el)=>{
        return !isNaN(parseInt(el)) && isFinite(el) && el!=0; // delete 0 and undefined values.
    })

    console.log(critere+" DATA : ",valuesData);

    if(valuesData.length==0) return ;

    let minMax = getMinMax(valuesData);

    console.log("Min, Max : ",minMax[0],minMax[1]);

    let moyenne = average(valuesData);

    console.log(`Moyenne ${critere} data : `, moyenne);

    // todo : Prendre l'écart type ? 
    //let ecart = minMax[1] - moyenne;
    let ecart = getEcart(valuesData,moyenne);

    console.log("Ecart choisit : ",ecart);

    return {
        "values":valuesData,
        "min": minMax[0],
        "max":minMax[1],
        "average":moyenne,
        "ecart":ecart,
    }

}

module.exports.launch = async function launch(data,data2=[common.exampleScrapperData]){
    // test critères : 
    let crit_less = ["size","nbRequest","domSize","cssOrJsNotExt","ratioimagesResizedInPage","ratioHttp1"]; // Plus la valeur est bas, plus on est dans l'excellent
    let crit_more = ["etagsNb"];
    var fuzzification = {};
    let url_data = Object.values(data2[0])[0];
    // Test
    console.log(`Fuzzy logic`);
    for(let i of crit_less){
        console.log("Critère testé :",i);
        const result = getSpecificData(data,i);
        
        if(!result) continue;
        
        if(result.min >= url_data[i]){
            result.min = url_data[i]-1;
        }

        if(result.max <= url_data[i]){
            result.max = url_data[i]+1;
        }

        console.log("Data testé : ",url_data[i]);
        const fuzzyVal = getFuzzyValue(url_data[i],result);    
        fuzzification[i] = fuzzyVal;
    }

    // Todo : Implémenter les règles ...
    return fuzzification;
}


function getFuzzyValue(value,data,inverse=false) {
    // For simplicity and for now ... The membership function will be triangle.
    /*
    exemple of membership function c1 : size of webpage

    excelent     medium   bad
        |\        / \     /|
        | \      /   \   / |
        |  \    /     \ /  |
        |   \  /       /   |
        |    \/       / \  |
        |___/_\______/___\_|____

    */
    let min = data.min;
    let aver = data.average;
    let ecar = data.ecart;
    let max = data.max;

    let excellant = fuzzylogic.triangle(value, min,min,aver);
    let medium = fuzzylogic.triangle(value, aver-ecar, ecar, aver+ecar);
    let bad = fuzzylogic.triangle(value, aver,max,max);

    if(inverse){
        excellant = fuzzylogic.triangle(value, aver,max,max);
        bad = fuzzylogic.triangle(value, min,min,aver);
    }

    console.log('excellant: '+ excellant);
    console.log('medium: '+ medium);
    console.log('bad: '+bad);
    return [excellant,medium,bad];
};

