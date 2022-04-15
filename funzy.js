const fuzzylogic = require('fuzzylogic')

var threatCalc = function(threat) {
    var probabNoAttack          = fuzzylogic.triangle(threat, 0, 40, 80);
    var probabNormalAttack      = fuzzylogic.trapezoid(threat, 30,40, 100, 110);
    var probabEnragedAttack     = fuzzylogic.triangle(threat, 90,110,125);
    console.log('Threat: ' + threat);
    console.log('excellant: '       + probabNoAttack);
    console.log('medium: '   + probabNormalAttack);
    console.log('bad: '  + probabEnragedAttack);
};

threatCalc(80)