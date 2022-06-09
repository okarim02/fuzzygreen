const Logic = require('es6-fuzz');
const Grade = require('es6-fuzz/lib/curve/grade');
const Trapezoid = require('es6-fuzz/lib/curve/trapezoid');
const Triangle = require('es6-fuzz/lib/curve/triangle');
const fuzzylogic = require('fuzzylogic');
// version JS
var FuzzyLogic=function(){"use strict";var a=function(){};return a.prototype={getResult:function(a){var b=this.construct(a.variables_input),c=this.fuzzification(a.crisp_input,b),d=this.output_combination(c,a.inferences,a.variable_output),e=this.takeMaxOfArraySet(d),f=this.defuzzification(e,this.construct_variable(a.variable_output.sets));return f},construct:function(a){var c,b=[];for(c=a.length-1;c>=0;c-=1)b[c]=this.construct_variable(a[c].sets);return b},construct_variable:function(a){var c,b=[];for(c=a.length-1;c>=0;c-=1)b[c]={a:a[c],firstPoint:a[c][0]===a[c][1]?1:0,lastPoint:a[c][2]===a[c][3]?1:0,mUp:1/(a[c][1]-a[c][0]),mDown:1/(a[c][3]-a[c][2])};return b},fuzzification:function(a,b){var d,c=[];for(d=b.length-1;d>=0;d-=1)c[d]=this.fuzzification_variable(a[d],b[d]);return c},fuzzification_variable:function(a,b){var d,c=[];for(d=b.length-1;d>=0;d-=1)c[d]=this.fuzzification_function(a,b[d]);return c},fuzzification_function:function(a,b){var c=0;return b.a[0]>=a?c=b.firstPoint:b.a[1]>a?c=b.mUp*(a-b.a[0]):b.a[2]>=a?c=1:b.a[3]>a?c=1-b.mDown*(a-b.a[2]):a>=b.a[3]&&(c=b.lastPoint),c},output_combination:function(a,b,c){var e,f,d=[];for(e=c.sets.length-1;e>=0;e-=1)d[e]=[];for(e=b.length-1;e>=0;e-=1)for(f=b[e].length-1;f>=0;f-=1)b[e][f]>=0&&d[b[e][f]].push(a[e][f]);return d},defuzzification:function(a,b){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,c=0,d=0;for(e=a.length-1;e>=0;e-=1)f=b[e],g=f.a,h=a[e],i=g[3]-g[0],k=g[0],g[0]!==g[1]&&(k+=h/f.mUp),l=g[3],g[2]!==g[3]&&(l-=h/f.mDown),m=0,g[0]!==k&&(m+=(k-g[0])*a[e]/2),k!==l&&(m+=(l-k)*a[e]),l!==g[3]&&(m+=(g[3]-l)*a[e]/2),j=l-k,n=h/3*(i+2*j)/(j+i),p=k+(l-k)/2,q=g[0]+(g[3]-g[0])/2,r=0,0!==p-q&&(r=h/(p-q)),o=q,0!==r&&(o+=n/r),c+=m*o,d+=m;return 0===d?0:c/d},takeMaxOfArraySet:function(a){var c,b=[];for(c=a.length-1;c>=0;c-=1)b[c]=this.takeMaxOfArray(a[c]);return b},takeMaxOfArray:function(a){var c,b=a[0];for(c=1;a.length>c;c+=1)b=a[c]>b?a[c]:b;return b}},a}();
var rules = require('./fuzzy_logic-rules');
const tools = require('./tools');

// step 1 : Linguistic variables : les critères 
// POur chaque critères : Excellent, Medium, Bad

/**
 * Sr.No
 * 1) 
 * IF PageSize=Excellent AND RequestNb=Excellent AND DOMsize=Excellent then Sustainability is Excellent
 * IF PageSize=MEDIUM AND RequestNb= Excellent AND DOMsize= Excellent then Sustainability is Excellent
 * IF PageSize=Excellent AND RequestNb= Bad AND DOMsize= Bad then Sustainability is Medium
*/

/**
 * Matrice
 * 	 | E M B
 * --|-------
 * E | E E M
 * M | E M M   <- sustainability 
 * B | M M B
 */
function draw(x1,y1,x2,y2,x3,y3,x4,y4){
	const result = `
    <svg
    width="541"
    height="271"
    >

        <rect
            width="541"
            height="271"
            x="0"
            y="0"
            fill="#3d5ea1"
        />

        <polygon
            fill="white"
            points="${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}"
        />

    </svg>
`
	tools.draw(result);
}

function main(){
	data = {
        "min" : 10,
        "average" : 90,
        "gap" : 15,
        "max" : 120
    }

	// Linguistic variable :  Excellent, Medium, Bad
	/**
	 * DomSize is *3 more important than PageSize AND DOmsize is *1 more important than RequestNb
	 * RequstNb is *2 more important than PageSize
	 * 
	 * Set of rules: 
	 * IF PageSize=Excellent AND RequestsNb=Excellent AND DOMsize=Excellent then Sustainability is Excellent
	 * IF PageSize=Bad AND RequestsNb= Bad AND DOMsize= Excellent then Sustainability is Medium
	 * IF PageSize=Excellent AND RequestsNb= Bad AND DOMsize= Bad then Sustainability is Bad
	*/
	var logic = new Logic();

	// Fuzzifier ===========================

	var fuzzyvariable_pageSize = logic 
	.init('excellent', new Triangle(10, 10, 30))
	.or('medium', new Triangle(15,30,50))
	.or('bad', new Triangle(30,65,65))
		.defuzzify(5); // Example : pageSize = 5 Ko => except : Excellent

	var fuzzyvariable_DOMsize = logic
	.init('excellent', new Triangle(20, 60, 100))
	.or('medium', new Triangle(85,125,150))
	.or('bad', new Triangle(115,180,225))
		.defuzzify(25); // Example : domSize = 25 nodes => except : Excellent
	
// Rules : 
	// IF PageSize is Excellent AND DOMsize is Excellent THEN sustainability IS Excellent 
	// IF PageSize is Medium THEN sustainability IS Medium 
	// IF PageSize is Bad AND DOMsize is Bad THEN sustainability IS Bad 

	sustainability = {}
	sustainability.excellant = fuzzyvariable_DOMsize.defuzzified == "excellent" && fuzzyvariable_pageSize.defuzzified == "excellent" ? "excellent":"";
	sustainability.medium = fuzzyvariable_DOMsize.defuzzified == "medium"  ? "medium":"";
	sustainability.bad = fuzzyvariable_DOMsize.defuzzified == "bad" && fuzzyvariable_pageSize.defuzzified == "bad" ? "bad":"";

	/*
	
	// Faux : let res = Math.min(fuzzyvariable_pageSize.rules[0].fuzzy,fuzzyvariable_DOMsize.rules[0].fuzzy) || Math.min(fuzzyvariable_pageSize.rules[0].fuzzy,fuzzyvariable_DOMsize.rules[0].fuzzy) || Math.min(fuzzyvariable_pageSize.rules[0].fuzzy,fuzzyvariable_DOMsize.rules[0].fuzzy)
// essais 
	var fuzzy_sus = logic
	.init('excellent',new Triangle(0.55,1,1))
	.or('medium',new Triangle(0.08333,0.5,0.9167)) // cordonnées construit automatiquement via MathLab.
	.or('bad',new Triangle(-0.4167,0,0.4167))
		.defuzzify(res)
	
	console.log(fuzzy_sus);

	
	var fuzzyvariable_RequestsNb = logic
	.init('Excellent', new Triangle(0, 50, 65))
	.or('Medium', new Triangle(60,100,110))
	.or('Bad', new Triangle(105,150,200))
		.defuzzify(160); // Example : Requests numbers = 10 => except : Excellent

	var fuzzyvariable_DOMsize = logic
	.init('Excellent', new Triangle(20, 60, 100))
	.or('Medium', new Triangle(85,125,150))
	.or('Bad', new Triangle(115,180,225))
		.defuzzify(150); // Example : domSize = 60 => except : Medium

	console.log(fuzzyvariable_pageSize.defuzzified + "," + fuzzyvariable_RequestsNb.defuzzified + ","+ fuzzyvariable_DOMsize.defuzzified)

	// Fuzzy rules  
	var sustainability = {}; // exc && exc && exc 
	sustainability.excellent = fuzzyvariable_pageSize.toString() == "Excellent" &&  fuzzyvariable_RequestsNb.toString() == "Excellent" &&  (fuzzyvariable_DOMsize.toString() == "Medium" || fuzzyvariable_DOMsize.toString() == "Excellent") ? 1 : 0
	sustainability.medium = fuzzyvariable_pageSize.toString() == "Bad" &&  fuzzyvariable_RequestsNb.toString() == "Bad" &&  fuzzyvariable_DOMsize.toString() == "Excellent" ? 1 : 0
	sustainability.bad = fuzzyvariable_pageSize.toString() == "Excellent" &&  fuzzyvariable_RequestsNb.toString() == "Bad" &&  fuzzyvariable_DOMsize.toString() == "Bad" ? 1 : 0
	
	// More compact 
	sustainability.excellent = (fuzzyvariable_pageSize.toString() == "Excellent" && fuzzyvariable_RequestsNb.toString() == "Excellent") || fuzzyvariable_DOMsize.toString() == "Excellent" // ...   

	console.log(sustainability);
	// ... 
	
	// -----------------
	// Test dessiner un trapeze : 
	//draw(20,0,30,1,90,1,100,0);
 
	var logic = new Logic();
	var res = logic
	.init('noAttack', new Triangle(0, 20, 40))
	.or('normalAttack', new Trapezoid(20, 30, 90, 100))
	.or('enragedAttack', new Grade(90, 100))
		.defuzzify(40);
	*/
}


function fuzzyNodejs(){
	sustainability = {}; // Output of 
    data = {
        "min" : 10,
        "average" : 90,
        "ecart" : 15,
        "max" : 120
    }
	// critère testé : domsize
    let fuzzydom = getFuzzyValue(50,data);
	// fuzzyvariable : [0.5,0,0] => excellant : 50%

	// test rule : IF domSize is Excellant Then Sustainability is Excellant / IF domSIZE is Bad Then Susttainability is Bad

	
	// step 4 : Obtain fuzzy value
	sustainability.medium = rules.and(fuzzydom,[0,0,0],()=>{

	})

	data2 = {
        "min" : 10,
        "average" : 50,
        "ecart" : 15,
        "max" : 100
    }

	// critère testé : RequestNb
	// Crisp input : 25
    let fuzzyRequestNb = getFuzzyValue(25,data2);

	// test rule : IF domSize is Excellent AND RequestNb is Excellent Then Sustainability is Excellent
	rules.or(fuzzydom,fuzzyRequestNb,()=>{
		console.log("a");
	},()=>{
		console.log("b");
	})

    // WTF ?
    var resGrade = fuzzylogic.grade(3,0,1);
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

function fuzzyJS(){
    
    var obj = {
		crisp_input: [150, 10, 10],
		variables_input: [
			{
				name: "Size",
				setsName: ["Excellent", "Medium", "Bad"],
				sets: [
					[0,0,25,150],
					[25,150,150,300],
					[150,300,400,400]
				]
			},
			{
				name: "RequestsNb",
				setsName: ["Excellent", "Medium", "Bad"],
				sets: [
					[0,0,0,10],
					[0,10,10,30],
					[10,30,40,40]
				]
			},
			{
				name: "DOMsize",
				setsName: ["Excellent", "Medium", "Bad"],
				sets: [
					[0,0,0,10],
					[0,10,10,30],
					[10,30,40,40]
				]
			}
		],
		variable_output: {
			name: "Desirability",
			setsName: ["Undesirable", "Desirable", "Very Desirable"],
			sets: [
				[0,0,25,50],
				[25,50,50,75],
				[50,75,100,100]
			]
		},
		inferences: [
			[0,2,0],
			[0,1,2],
			[2,1,0]
		]
	};

    var f1 = new FuzzyLogic()

    const result = f1.getResult(obj);
    console.log(result);
}

// Test fuzzymodule

var FuzzyModule = require('fuzzymodule');

var AttackModule = function() {

    this.fzmod = new FuzzyModule();

    this.distanceFLV = this.fzmod.createFLV("distance");

    this.close_to_target = this.distanceFLV.addLeftShoulderSet("close", 0, 9000, 40000);
    this.average_to_target = this.distanceFLV.addTriangleSet("average", 9000, 40000, 60000);
    this.far_to_target = this.distanceFLV.addRightShoulderSet("far", 40000, 60000, 400000);

    this.sizeFLV = this.fzmod.createFLV("size");

    this.small_target = this.sizeFLV.addLeftShoulderSet("small", 1, 3, 6);
    this.medium_target = this.sizeFLV.addTriangleSet("medium", 3, 6, 8);
    this.big_target = this.sizeFLV.addRightShoulderSet("big", 6, 8, 10);

    this.desirabilityFLV = this.fzmod.createFLV("desirability");

    this.undesirable = this.desirabilityFLV.addLeftShoulderSet("undesirable", 0, 30, 50);
    this.desirable = this.desirabilityFLV.addTriangleSet("desirable", 30, 50, 70);
    this.very_desirable = this.desirabilityFLV.addRightShoulderSet("very_desirable", 50, 70, 100);

    this.declareRules = function() {
        var close = this.fzmod.makeNewFuzzyTerm(this.close_to_target);
        var average = this.fzmod.makeNewFuzzyTerm(this.average_to_target);
        var far = this.fzmod.makeNewFuzzyTerm(this.far_to_target);

        var small = this.fzmod.makeNewFuzzyTerm(this.small_target);
        var medium = this.fzmod.makeNewFuzzyTerm(this.medium_target);
        var big = this.fzmod.makeNewFuzzyTerm(this.big_target);

        var desirable = this.fzmod.makeNewFuzzyTerm(this.desirable);
        var undesirable = this.fzmod.makeNewFuzzyTerm(this.undesirable);
        var very_desirable = this.fzmod.makeNewFuzzyTerm(this.very_desirable);

        this.fzmod.addRule(close.fzAndWith(small), desirable);
        this.fzmod.addRule(close.fzAndWith(medium), desirable);
        this.fzmod.addRule(close.fzAndWith(big), very_desirable);

        this.fzmod.addRule(average.fzAndWith(small), undesirable);
        this.fzmod.addRule(average.fzAndWith(medium), desirable);
        this.fzmod.addRule(average.fzAndWith(big), very_desirable);

        this.fzmod.addRule(far.fzAndWith(small), undesirable);
        this.fzmod.addRule(far.fzAndWith(medium), undesirable);
        this.fzmod.addRule(far.fzAndWith(big), desirable);
    };

    this.getCrispValue = function(distance, size) {
        this.fzmod.fuzzify("distance", distance);
        this.fzmod.fuzzify("size", size);
        this.declareRules();
        return this.fzmod.deFuzzify("desirability");
    };

}

var a = new AttackModule();
let result = a.getCrispValue(47900, 5);

//console.log(result)

var SustainabilityModule = function() {

    this.fzmod = new FuzzyModule();

    this.domSizeFLV = this.fzmod.createFLV("domSize");

    this.excellent_domSize = this.domSizeFLV.addTriangleSet("excellent", 10, 10, 30);
    this.medium_domSize = this.domSizeFLV.addTriangleSet("medium", 10, 30, 50);
    this.bad_domSize = this.domSizeFLV.addTriangleSet("bad", 30, 50, 65);

    this.requestNbFLV = this.fzmod.createFLV("requestsNb");

    this.excellent_requestsNb = this.requestNbFLV.addTriangleSet("excellent", 20, 60,100);
    this.medium_requestsNb = this.requestNbFLV.addTriangleSet("medium", 60, 100, 200);
    this.bad_requestsNb = this.requestNbFLV.addTriangleSet("bad", 100, 200, 250);

    this.sustainabilityFLV = this.fzmod.createFLV("sustainability");

    this.bad_sustainability = this.sustainabilityFLV.addTriangleSet("bad", 0, 30, 50);
    this.medium_sustainability = this.sustainabilityFLV.addTriangleSet("medium", 30, 50, 70);
    this.excellent_sustainability = this.sustainabilityFLV.addTriangleSet("excellent", 50, 70, 100);

    this.declareRules = function() {
        var veryGood_domSize = this.fzmod.makeNewFuzzyTerm(this.excellent_domSize);
        var good_domSize = this.fzmod.makeNewFuzzyTerm(this.medium_domSize);
        var veryBad_domSize = this.fzmod.makeNewFuzzyTerm(this.bad_domSize);

        var veryGood_requestsNb = this.fzmod.makeNewFuzzyTerm(this.excellent_requestsNb);
        var good_requestsNb = this.fzmod.makeNewFuzzyTerm(this.medium_requestsNb);
        var veryBad_requestsNb = this.fzmod.makeNewFuzzyTerm(this.bad_requestsNb);

        var veryGood_sustainability = this.fzmod.makeNewFuzzyTerm(this.excellent_sustainability);
        var good_sustainability = this.fzmod.makeNewFuzzyTerm(this.medium_sustainability);
        var veryBad_sustainability = this.fzmod.makeNewFuzzyTerm(this.bad_sustainability);

        this.fzmod.addRule(veryGood_domSize.fzAndWith(veryGood_requestsNb), veryGood_sustainability);
        this.fzmod.addRule(veryGood_domSize.fzAndWith(good_requestsNb), veryGood_sustainability);
        this.fzmod.addRule(veryGood_domSize.fzAndWith(veryBad_requestsNb), good_sustainability);

        this.fzmod.addRule(good_domSize.fzAndWith(veryGood_requestsNb), veryGood_sustainability);
        this.fzmod.addRule(good_domSize.fzAndWith(good_requestsNb), good_sustainability);
        this.fzmod.addRule(good_domSize.fzAndWith(veryBad_requestsNb), veryBad_sustainability);

        this.fzmod.addRule(veryBad_domSize.fzAndWith(veryGood_requestsNb), good_sustainability);
        this.fzmod.addRule(veryBad_domSize.fzAndWith(good_requestsNb), veryBad_sustainability);
        this.fzmod.addRule(veryBad_domSize.fzAndWith(veryBad_requestsNb), veryBad_sustainability);
    };

    this.getCrispValue = function(domSize, requestsNb) {
        this.fzmod.fuzzify("domSize", domSize);
        this.fzmod.fuzzify("requestsNb", requestsNb);
        this.declareRules();
        return this.fzmod.deFuzzify("sustainability");
    };

}

var b = new SustainabilityModule();
let result2 = b.getCrispValue(10, 200); // Plus la valeur est grande, plus le site est excellent
console.log(result2)
