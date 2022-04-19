const fuzzylogic = require('fuzzylogic');
const common = require('./common');

module.exports.requestsFuzzyLogic = async function(requests) {

    var probabExcellent = fuzzylogic.triangle(requests, 0, 40, 80);
    var probabMedium = fuzzylogic.trapezoid(requests, 30,40, 100, 110);
    var probabBad = fuzzylogic.triangle(requests, 90,110,125);
    console.log('Pratique: ' + "Nombres de requêtes");
    console.log('excellant: '+ probabExcellent);
    console.log('medium: '+ probabMedium);
    console.log('bad: '+probabBad);
};
