const fuzzylogic = require('fuzzylogic')

module.exports.requestsFuzzyLogic = async function(requests) {
    var probabExcellent = fuzzylogic.triangle(requests, 0, 40, 80);
    var probabMedium = fuzzylogic.trapezoid(requests, 30,40, 100, 110);
    var probabBad = fuzzylogic.triangle(requests, 90,110,125);
    console.log('Pratique: ' + requests);
    console.log('excellant: '       + probabExcellent);
    console.log('medium: '   + probabMedium);
    console.log('bad: '  + probabBad);
};
