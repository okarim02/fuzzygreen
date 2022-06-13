const fuzzylogic = require('fuzzylogic'); // Todo : Paquet npm à supprimer
const common = require('./common');
const FuzzyModule = require('fuzzymodule');

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
    Linguistic output for now : excellant, medium, bad. 
*/

class fuzzyVariable{
    constructor(var1,var2){
        this.fzmod = new FuzzyModule(); // Objet qui contient toutes les fonctions utiles:  création variables linguistics, création des fonctions d'apparteance, règles, fuzzification ...  
        this.var1 = var1;
        this.var2 = var2;
        this.var1_linguistic_var;
        this.var2_linguistic_var;

        this.init();
    }
    
    init(){
        // Result
        this.sustainabilityFLV = this.fzmod.createFLV("sustainability");
    
        this.bad_sustainability = this.sustainabilityFLV.addTriangleSet("bad", 0, 30, 50);
        this.medium_sustainability = this.sustainabilityFLV.addTriangleSet("medium", 30, 50, 70);
        this.excellent_sustainability = this.sustainabilityFLV.addTriangleSet("excellent", 50, 70, 100);
    }
    
    critere_module(critere,min,max,average,ecart_type) {
    
        //this.fzmod = new FuzzyModule();
        if(this.var1 == critere){
            this.var1_linguistic_var = this.fzmod.createFLV(critere);
            this.excellent_critere1 = this.var1_linguistic_var.addTriangleSet("excellent", min,min,average);
            this.medium_critere1 = this.var1_linguistic_var.addTriangleSet("medium", average-ecart_type, ecart_type, average+ecart_type);
            this.bad_critere1 = this.var1_linguistic_var.addTriangleSet("bad", average,max,max);
        }else{ 
            this.var2_linguistic_var = this.fzmod.createFLV(critere);
            this.excellent_critere2 = this.var2_linguistic_var.addTriangleSet("excellent", min,min,average);
            this.medium_critere2 = this.var2_linguistic_var.addTriangleSet("medium", average-ecart_type, ecart_type, average+ecart_type);
            this.bad_critere2 = this.var2_linguistic_var.addTriangleSet("bad", average,max,max);
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
        this.fzmod.addRule(veryGood_critere2.fzOrWith(good_critere2), veryGood_sustainability);
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
     
    // a déplacer ... 
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

    let median = getMedian(valuesData);

    return {
        "values":valuesData,
        "min": minMax[0],
        "max":minMax[1],
        "average":moyenne,
        "ecart":ecart,
        "median": median
    }

}

module.exports.launch = async function launch(data=[common.otherExempleOfScrapperData],data2=[common.exampleScrapperData]){
    // test critères : 
    let crit_less = ["PageSize(Ko)","RequestsNb","DOMsize(nb elem)","imgResize","cssFiles","etagsNb"]; // Plus la valeur est bas, plus on est dans l'excellent // critère retiré pour l'instant : "Http2requests"
    let crit_more = ["etagsNb"];
    var fuzzyLogic_values = {};
    let url_data = Object.values(data2[0])[0]; // Récupère les valeurs de l'url scanner
    // Test
    console.log(`Fuzzy logic`);
    /*
    Implémentation de la logique floue : 
    1) Obtenir la Sustainability avec comme entrée : deux critères => établir les fonctions d'appartenance + règles basics. et sauvegarder; le résultat sortit sera o1,o2,o3....
    2) faire l'étape 1) jusqu'a il n'y a plus de critères restant.
    3) Avec les résultats refaire la même chose mais avec comme entrée o1,o2,... et obtenir le résultat final : s1
    
    Exemple : 
        Entrées : Size(Kb), RequestsNb  => Sortie : o1 = 70 (Excellent: 0,5; Medium: 0,5; Bad:0)
        Entrées : DOMsize(nb elem), CSSNotExt  => Sortie : o2 = 30 (Excellent: 0; Medium: 0,5; Bad:0.5)
        ... 
        // étape 3 
        Entrées : o1, o2 => Sortie : s1 
        ... 

        // Etape 4 
        s1 + s2 + s3 => Sustainability : Good => x, medium => x, bad => x 

    */
    var s_list = []
    for(let i = 0 ; i < crit_less.length-2;i+=2){

        let result_act = getSpecificData(data,crit_less[i]); // résultat actuelle
        let result_ap = getSpecificData(data,crit_less[i+1]); // résultat du critère suivant

        console.log("res1 :",result_act);
        console.log("res2 :",result_ap);

        if(result_act== undefined || result_ap==undefined) continue;
        
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

        a.critere_module(crit_less[i],result_act.min_tmp || result_act.min,result_act.max_tmp || result_act.max,result_act.average,result_act.ecart);
        a.critere_module(crit_less[i+1],result_ap.min_tmp || result_ap.min, result_ap.max_tmp || result_ap.max,result_ap.average,result_ap.ecart);

        let fuzzyval1 = a.getCrispValue(url_data[crit_less[i]], url_data[crit_less[i+1]]);

        console.log("o"+i," : ",fuzzyval1);
        
        s_list.push(fuzzyval1);

        fuzzyLogic_values[crit_less[i]] = {} 
        fuzzyLogic_values[crit_less[i+1]] = {} 

        fuzzyLogic_values[crit_less[i]]["fuzzification"] = fuzzyval1; // todo : obtenir le résultat fuzzy d'un critère 
        fuzzyLogic_values[crit_less[i+1]]["fuzzification"] = fuzzyval1;

        fuzzyLogic_values[crit_less[i]]["other"] = {min: result_act.min , max: result_act.max, moyenne : result_act.average, median: result_act.median};
        fuzzyLogic_values[crit_less[i+1]]["other"] = {min: result_ap.min , max: result_ap.max, moyenne : result_ap.average, median: result_ap.median};

    }

    let max = 0;
    for(let i of s_list){
        if(i>max){
            max=i
        }
    }

    console.log("Sustainable : ",max);
    
    fuzzyLogic_values["sustainable"]=max;

    // Todo : Implémenter les règles ...
    return fuzzyLogic_values;
}
