const fuzzylogic = require('fuzzylogic'); // A supprimer x)
const common = require('./common');
const FuzzyModule = require('fuzzymodule');
const Logic = require('es6-fuzz');
const Triangle = require('es6-fuzz/lib/curve/triangle');
const Trapezoid = require('es6-fuzz/lib/curve/trapezoid');

var crit_less = ["PageSize(Ko)","RequestsNb","DOMsize(nb elem)","imgResize","cssFiles","Http1.1/Http2requests","JSMinification","CSSMinification","imagesWithoutLazyLoading","FontsNb","etagsRatio","etagsNb","lazyLoadRatio","host"]; // Plus la valeur est bas, plus on est dans l'excellence
var crit_more = ["etagsNb","etagsRatio","lazyLoadRatio"]; // todo : modifier les fonctions d'appartenance pour ce genre de critère  


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

function getMedian(arr){
    const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2.0;
}

/*
    Linguistic output for now : excellent, medium, bad. 
*/

class fuzzyVariable{
    constructor(var1,var2){
        this.fzmod = new FuzzyModule(); // Objet qui contient toutes les fonctions utiles:  création variables linguistics, création des fonctions d'apparteance, règles, fuzzification ...  

        this.var1 = var1;
        this.var2 = var2;
        this.var1_linguistic_var = this.fzmod.createFLV(var1);
        this.var2_linguistic_var = this.fzmod.createFLV(var2);
        
        this.init();
    }
    
    init(){
        // Result
        this.sustainabilityFLV = this.fzmod.createFLV("sustainability");
    
        this.bad_sustainability = this.sustainabilityFLV.addTriangleSet("bad", 0, 30, 50);
        this.medium_sustainability = this.sustainabilityFLV.addTriangleSet("medium", 30, 50, 70);
        this.excellent_sustainability = this.sustainabilityFLV.addTriangleSet("excellent", 50, 70, 100);
    }

    create_function_forVar1(figure,name,x0,x1,x2,x3){
        if(figure == "triangle"){
            return this.var1_linguistic_var.addTriangleSet(name,x0,x1,x2);
        }else{
            return this.var1_linguistic_var.addTrapezoidSet(name,x0,x1,x2,x3);
        }
    }

    create_function_forVar2(figure,name,x0,x1,x2,x3){
        if(figure == "triangle"){
            return this.var2_linguistic_var.addTriangleSet(name,x0,x1,x2);
        }else{
            return this.var2_linguistic_var.addTrapezoidSet(name,x0,x1,x2,x3);
        }
    }

    critere_module(critere,cords) { // ancien parametres : figure,critere,min,max,average,ecart_type
        console.log("Debug Critere module : ",cords);
        if(this.var1 == critere){
            this.excellent_critere1 = this.create_function_forVar1(cords.figure,"excellent", cords.excellent.x0,cords.excellent.x1,cords.excellent.x2,cords.excellent.x3);
            this.medium_critere1 = this.create_function_forVar1(cords.figure,"medium", cords.medium.x0,cords.medium.x1,cords.medium.x2,cords.medium.x3);
            this.bad_critere1 =this.create_function_forVar1(cords.figure,"bad", cords.bad.x0,cords.bad.x1,cords.bad.x2,cords.bad.x3);
        }else{ 
            this.excellent_critere2 = this.create_function_forVar2(cords.figure,"excellent", cords.excellent.x0,cords.excellent.x1,cords.excellent.x2,cords.excellent.x3);
            this.medium_critere2 = this.create_function_forVar2(cords.figure,"medium", cords.medium.x0,cords.medium.x1,cords.medium.x2,cords.medium.x3);
            this.bad_critere2 =this.create_function_forVar2(cords.figure,"bad", cords.bad.x0,cords.bad.x1,cords.bad.x2,cords.bad.x3);
        }
    }


    declareRules(){
        var veryGood_critere1 = this.fzmod.makeNewFuzzyTerm(this.excellent_critere1);
        var good_critere1 = this.fzmod.makeNewFuzzyTerm(this.medium_critere1);
        var veryBad_critere1 = this.fzmod.makeNewFuzzyTerm(this.bad_critere1);

        var veryGood_critere2 = this.fzmod.makeNewFuzzyTerm(this.excellent_critere2);
        var good_critere2 = this.fzmod.makeNewFuzzyTerm(this.medium_critere2);
        var veryBad_critere2 = this.fzmod.makeNewFuzzyTerm(this.bad_critere2);

        var veryGood_sustainability = this.fzmod.makeNewFuzzyTerm(this.excellent_sustainability);
        var good_sustainability = this.fzmod.makeNewFuzzyTerm(this.medium_sustainability); // good <=> medium
        var veryBad_sustainability = this.fzmod.makeNewFuzzyTerm(this.bad_sustainability); 

        // règles basique

        this.fzmod.addRule(veryGood_critere1.fzAndWith(veryGood_critere2), veryGood_sustainability);
        this.fzmod.addRule(veryGood_critere1.fzAndWith(good_critere2), veryGood_sustainability);
        this.fzmod.addRule(veryGood_critere1.fzAndWith(veryBad_critere2), good_sustainability);

        this.fzmod.addRule(good_critere1.fzAndWith(veryGood_critere2), veryGood_sustainability);
        this.fzmod.addRule(good_critere1.fzAndWith(good_critere2), good_sustainability);
        this.fzmod.addRule(good_critere1.fzAndWith(veryBad_critere2), veryBad_sustainability);

        this.fzmod.addRule(veryBad_critere1.fzAndWith(veryGood_critere2), good_sustainability);
        this.fzmod.addRule(veryBad_critere1.fzAndWith(good_critere2), veryBad_sustainability);
        this.fzmod.addRule(veryBad_critere1.fzAndWith(veryBad_critere2), veryBad_sustainability);

    }

    getCrispValue(var1, var2) {
        this.fzmod.fuzzify(this.var1, var1);
        this.fzmod.fuzzify(this.var2, var2);

        this.declareRules();
        return this.fzmod.deFuzzify("sustainability");
    }
}

// todo : refaire cette fonction pour inclure directement les données du critère
function getSpecificData(data,critere){
    let valuesData = []
    data.map((obj)=>{
        Object.values(obj).forEach(url=>{
            
            if(typeof url[critere] === 'object' && !Array.isArray(url[critere]) && url[critere] !== null){
                console.log("crits : ",critere, " données : ",url[critere]);
                valuesData.push(url[critere].nb); 
            }else{
                valuesData.push(url[critere]); 
            }
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

    let median = getMedian(valuesData);

    return {
        "values":valuesData || [],
        "min": minMax[0] || 0,
        "max":minMax[1] || 0,
        "average":moyenne || 0,
        "ecart":ecart || 0,
        "median": median || 0
    }

}

function getUndefinedData(){
    return {
        "values":[],
        "min":  0,
        "max":0,
        "average":0,
        "ecart": 0,
        "median": 0
    }
}
/**
 * 
 * @param {*} crit : critère  
 * @param {*} obj : Objet de la forme :
 * {
 *  'excellent' : {forme : 'triangle' , x0: 10 , x1 : 2 , x3:10}
 *  'medium' : {forme : 'triangle' , x0: 10 , x1 : 2 , x3:10}
 *  'bad' : {forme : 'trapezoid' , x0: 5 , x1 : 2 , x3:150, x4 : 169}
 * }
 */

 module.exports.edit = async function edit(fuzzy_data,crit,new_membershipFunction){

    console.log("DEBUG 1: ",fuzzy_data);
    console.log("DEBUG 2: ",crit);
    console.log("DEBUG 3: ",new_membershipFunction);

    let a = new fuzzyVariable(crit,fuzzy_data[crit]['pair']);

    fuzzy_data[crit].membership_function = new_membershipFunction;

    a.critere_module(crit,new_membershipFunction);
    console.log("DEBUG 3.2: ",fuzzy_data[fuzzy_data[crit].pair].membership_function);

    a.critere_module(fuzzy_data[crit].pair,fuzzy_data[fuzzy_data[crit].pair].membership_function);

    const fuzzyval = a.getCrispValue(fuzzy_data[crit].crisp_value, fuzzy_data[fuzzy_data[crit].pair].crisp_value);

    console.log("DEBUG 4: ",fuzzyval);

    fuzzy_data[crit]["result_fuzzificaton"]=fuzzyval;
    fuzzy_data[crit]["fuzzification"]= getBooleanFuzzy(fuzzy_data[crit].crisp_value,fuzzy_data[crit].membership_function);

    fuzzy_data[fuzzy_data[crit].pair]["result_fuzzificaton"]=fuzzyval;

    let s_list = []
    for(let i = 0 ; i < crit_less.length;i+=2){
        console.log(`DEBUG ${i-2}: `,crit_less[i]);

        s_list.push(fuzzy_data[crit_less[i]]["result_fuzzificaton"])
    }
    let new_result = getResult(s_list);

    console.log(`DEBUG ${9}: `,new_result);

    fuzzy_data["sustainable"]=getFuzzyValue(new_result);

    return fuzzy_data;
}

module.exports.launch = async function launch(data=[common.otherExempleOfScrapperData],data2=[common.exampleScrapperData]){

    // todo => Utiliser le tableau critère envoyé par l'utilisateur à la place de less ... 
    var fuzzyLogic_values = {};
    let url_data = Object.values(data2[0])[0]; // Récupère les valeurs de l'url scanner

    data.push(data2[0]);

    // Test
    console.log(`Fuzzy logic`);
    /*
    Implémentation de la logique floue : 
    1) Obtenir la Sustainability avec comme entrée : deux critères => établir les fonctions d'appartenance + règles basics. et sauvegarder; le résultat sortit sera o1,o2,o3....
    2) faire l'étape 1) jusqu'a il n'y a plus de critères restant.
    3) Avec les résultats refaire la même chose mais avec comme entrée o1,o2,... et obtenir le résultat final : s1
    
    Exemple : 
        Entrées : Size(Kb), RequestsNb  => Sortie : o1 = 70 (Excellent: 0,5; Medium: 0,5; Bad:0) correspond à la sustainability 
        Entrées : DOMsize(nb elem), cssFiles  => Sortie : o2 = 30 (Excellent: 0; Medium: 0,5; Bad:0.5)
        ... 
        
        // Etape 4 
        o1 + o2 + o3 (on prend le max)=> Sustainability : Good => x, medium => x, bad => x 

    */
    var s_list = []
    for(let i = 0 ; i < crit_less.length;i+=2){

        let result_act = getSpecificData(data,crit_less[i]) || getUndefinedData(); // résultat actuelle
        let result_ap = getSpecificData(data,crit_less[i+1]) || getUndefinedData(); // résultat du critère suivant

        fuzzyLogic_values[crit_less[i]] = {};
        fuzzyLogic_values[crit_less[i+1]] = {};

        console.log("res1 :",result_act);
        console.log("res2 :",result_ap);

        console.log("Donné testé c"+(i)+": ",url_data[crit_less[i]]);
        console.log("Donné testé c"+(i+1)+": ",url_data[crit_less[i+1]]);
        
        if(result_act.min >= url_data[crit_less[i]]){
            result_act.min_tmp = url_data[crit_less[i]]-1;
        }
        if(result_act.max <= url_data[crit_less[i]]){
            result_act.max_tmp = url_data[crit_less[i]]+1;
        }
        if(result_ap.min >= url_data[crit_less[i]]){
            result_ap.min_tmp = url_data[crit_less[i]]-1;
        }
        if(result_ap.max <= url_data[crit_less[i]]){
            result_ap.max_tmp = url_data[crit_less[i]]+1;
        }

        let a = new fuzzyVariable(crit_less[i],crit_less[i+1]);

        // Automatique
        let cords1 = {
            "excellent": {
                figure: "triangle",
                x0 : result_act.min_tmp || result_act.min,
                x1 : result_act.min_tmp || result_act.min,
                x2 : result_act.average
            },
            "medium" : {
                figure: "triangle",
                x0 : result_act.average-result_act.ecart,
                x1 : result_act.ecart,
                x2 : result_act.average+result_act.ecart
            },
            "bad": {
                figure: "triangle",
                x0 : result_act.average,
                x1 : result_act.max_tmp || result_act.max,
                x2 : result_act.max_tmp || result_act.max,
            }
        }


        fuzzyLogic_values[crit_less[i]]["membership_function"] = cords1;

        a.critere_module(crit_less[i],cords1);

        let cords2 = {
            "excellent": {
                figure: "triangle",
                x0 : result_ap.min_tmp || result_ap.min,
                x1 : result_ap.min_tmp || result_ap.min,
                x2 : result_ap.average
            },
            "medium" : {
                figure: "triangle",
                x0 : result_ap.average-result_ap.ecart,
                x1 : result_ap.ecart,
                x2 : result_ap.average+result_ap.ecart
            },
            "bad": {
                figure: "triangle",
                x0 : result_ap.average,
                x1 : result_ap.max_tmp || result_ap.max,
                x2 : result_ap.max_tmp || result_ap.max,
            }
        }

        fuzzyLogic_values[crit_less[i+1]]["membership_function"] = cords2

        a.critere_module(crit_less[i+1],cords2);

        let fuzzyval1 = a.getCrispValue(url_data[crit_less[i]], url_data[crit_less[i+1]]);

        console.log("o"+i," : ",fuzzyval1);
        
        s_list.push(fuzzyval1);

        fuzzyLogic_values[crit_less[i]]["crisp_value"]=url_data[crit_less[i]];
        fuzzyLogic_values[crit_less[i+1]]["crisp_value"]=url_data[crit_less[i+1]];


        fuzzyLogic_values[crit_less[i]]["result_fuzzificaton"]=fuzzyval1;
        fuzzyLogic_values[crit_less[i+1]]["result_fuzzificaton"]=fuzzyval1;

        fuzzyLogic_values[crit_less[i]]['pair'] = crit_less[i+1];
        fuzzyLogic_values[crit_less[i+1]]['pair'] = crit_less[i+1-1];

        fuzzyLogic_values[crit_less[i]]["fuzzification"] = getBooleanFuzzy(url_data[crit_less[i]],cords1);
        fuzzyLogic_values[crit_less[i+1]]["fuzzification"] = getBooleanFuzzy(url_data[crit_less[i+1]],cords2);

        fuzzyLogic_values[crit_less[i]]["other"] = {min: result_act.min , max: result_act.max, moyenne : result_act.average, median: result_act.median};
        fuzzyLogic_values[crit_less[i+1]]["other"] = {min: result_ap.min , max: result_ap.max, moyenne : result_ap.average, median: result_ap.median};

    }


    let max = getResult(s_list);

    console.log("Sustainable : ",max);
    
    fuzzyLogic_values["sustainable"]=getFuzzyValue(max);


    console.log("echelle : ",fuzzyLogic_values["sustainable"]);

    console.log("fuzzy data : ",fuzzyLogic_values);

    // Todo : Implémenter les règles ...
    return fuzzyLogic_values;
}

function getResult(s_list) {
    let max = 0;
    /*
    Sustainability = Math.max(s0,s1,...)
    */
    for (let i of s_list) {
        if (i > max) {
            max = i;
        }
    }
    return max;
}

function getBooleanFuzzy(value,cords){
    var logic = new Logic();

    const excellent = cords.excellent.figure=="triangle" ? new Triangle(
        cords.excellent.x0,
        cords.excellent.x1,
        cords.excellent.x2,
        ) : new Trapezoid(
        cords.excellent.x0,
        cords.excellent.x1,
        cords.excellent.x2,
        cords.excellent.x3
        ) 

    const medium = cords.medium.figure=="triangle" ? new Triangle(
        cords.medium.x0,
        cords.medium.x1,
        cords.medium.x2,
        ) : new Trapezoid(
        cords.medium.x0,
        cords.medium.x1,
        cords.medium.x2,
        cords.medium.x3
        ) 
    
    const bad = 
    cords.bad.figure=="triangle" ? new Triangle(
        cords.bad.x0,
        cords.bad.x1,
        cords.bad.x2,
        ) : new Trapezoid(
        cords.bad.x0,
        cords.bad.x1,
        cords.bad.x2,
        cords.bad.x3
        ) 
    
    const res = logic
        .init('excellent', excellent)
        .or('medium',medium)
        .or('bad',bad)
    .defuzzify(value)

    console.log("DEBUg getBooleanFuzzy : ",res);

    return res.defuzzified;
}

function getFuzzyValue(value) {
    
    let excellent = fuzzylogic.triangle(value, 50,70,100);
    let medium = fuzzylogic.triangle(value, 30, 50, 70);
    let bad = fuzzylogic.triangle(value, 0,30,50);

    console.log('excellent: '+ excellent);
    console.log('medium: '+ medium);
    console.log('bad: '+bad);
    
    return [excellent,medium,bad];
};
