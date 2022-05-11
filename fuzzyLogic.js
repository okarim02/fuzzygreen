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

    console.log("SIZE DATA : ",valuesData);

    let minMax = getMinMax(valuesData);

    console.log("Min, Max : ",minMax[0],minMax[1]);

    let moyenne = average(valuesData);

    console.log("Moyenne size data : ", moyenne);

    // todo : Prendre l'écart type ? 
    let ecart = (minMax[1] - moyenne)/moyenne;

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
    console.log(`Fuzzy logic of ${"size"}`);
    const result = getSpecificData(data,"size");
    getFuzzyValue(3000,result);

    // test 2 avec c2 : Nombres d'etags
    const result2 = getSpecificData(data,"etagsNb");
    getFuzzyValue(10,result2);

}


function getFuzzyValue(value,data) {
    // For simplicity and for now ... The membership function will be triangle.
    /*

excelent     medium   bad
    |\        / \     /
    | \      /   \   /
    |  \    /     \ /
    |   \  /       / 
    |    \/       / \ 
    ____/_\______/___\______

    */
    let medium = fuzzylogic.triangle(value, data.average-data.ecart, data.average, data.average+data.ecart);
    let excellant = fuzzylogic.triangle(value, data.min,data.min,data.average);
    let bad = fuzzylogic.triangle(value, data.average,data.max,data.max);
    console.log('excellant: '+ excellant);
    console.log('medium: '+ medium);
    console.log('bad: '+bad);
    return [excellant,medium,bad];
};

