const fuzzylogic = require('fuzzylogic');
const common = require('./common');

/*
    Linguistic terms for now : excellant, medium, bad. 
*/

function Shape(x0, x1, x2, x3) {
    this.x0 = x0;
    this.x1 = x1;
    this.x2 = x2;
    this.x3 = x3;
}

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

module.exports.launch = async function launch(data){
    // Test avec c1 : poid de la page .
    console.log(`Fuzzy logic`);
    const result = getSpecificData(data,"size");
    if(result) getFuzzyValue(13569,result);

    // test 2 avec c2 : Nombres d'etags
    const result2 = getSpecificData(data,"etagsNb")
    if(result2) getFuzzyValue(45,result2,true);
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

