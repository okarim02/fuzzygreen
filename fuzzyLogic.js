const fuzzylogic = require('fuzzylogic');
const common = require('./common');

function average(array){
    let sum = 0 ;
    for(let i = 0 ; i < array.length;i++){ 
        sum+=array[i];
    }
    return sum/array.length;
}

// Todo 
function getMinMax(array){
    return [Math.min(...array),Math.max(...array)];
}


module.exports.getSpecificData = async function main(data){
    // Test avec c1 : poid de la page .
    const sizeData = data.map((obj)=>{
        let acc = [];
        Object.values(obj).forEach(e=>{
            acc.push(e[Object.keys(e)[0]])
        })
        return acc;
    }).filter((el)=>{
        return !isNaN(parseInt(el)) && isFinite(el) && el!=0; // delete 0 and undefined values.
    })
    console.log("SIZE DATA : ",sizeData);

    let minMax = getMinMax(sizeData);

    console.log("Min, Max : ",minMax[0],minMax[1]);

}

module.exports.requestsFuzzyLogic = async function(ecoIndex) {
    var UltraEco = fuzzylogic.triangle(requests, 0, 35, 50);
    var eco = fuzzylogic.trapezoid(requests, 30,40, 100, 110);
    var notEco = fuzzylogic.triangle(requests, 90,110,125);
    console.log('Pratique: ' + "Nombres de requêtes");
    console.log('excellant: '+ probabExcellent);
    console.log('medium: '+ probabMedium);
    console.log('bad: '+probabBad);
};

