const fuzzylogic = require('fuzzylogic');
// version JS
var FuzzyLogic=function(){"use strict";var a=function(){};return a.prototype={getResult:function(a){var b=this.construct(a.variables_input),c=this.fuzzification(a.crisp_input,b),d=this.output_combination(c,a.inferences,a.variable_output),e=this.takeMaxOfArraySet(d),f=this.defuzzification(e,this.construct_variable(a.variable_output.sets));return f},construct:function(a){var c,b=[];for(c=a.length-1;c>=0;c-=1)b[c]=this.construct_variable(a[c].sets);return b},construct_variable:function(a){var c,b=[];for(c=a.length-1;c>=0;c-=1)b[c]={a:a[c],firstPoint:a[c][0]===a[c][1]?1:0,lastPoint:a[c][2]===a[c][3]?1:0,mUp:1/(a[c][1]-a[c][0]),mDown:1/(a[c][3]-a[c][2])};return b},fuzzification:function(a,b){var d,c=[];for(d=b.length-1;d>=0;d-=1)c[d]=this.fuzzification_variable(a[d],b[d]);return c},fuzzification_variable:function(a,b){var d,c=[];for(d=b.length-1;d>=0;d-=1)c[d]=this.fuzzification_function(a,b[d]);return c},fuzzification_function:function(a,b){var c=0;return b.a[0]>=a?c=b.firstPoint:b.a[1]>a?c=b.mUp*(a-b.a[0]):b.a[2]>=a?c=1:b.a[3]>a?c=1-b.mDown*(a-b.a[2]):a>=b.a[3]&&(c=b.lastPoint),c},output_combination:function(a,b,c){var e,f,d=[];for(e=c.sets.length-1;e>=0;e-=1)d[e]=[];for(e=b.length-1;e>=0;e-=1)for(f=b[e].length-1;f>=0;f-=1)b[e][f]>=0&&d[b[e][f]].push(a[e][f]);return d},defuzzification:function(a,b){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,c=0,d=0;for(e=a.length-1;e>=0;e-=1)f=b[e],g=f.a,h=a[e],i=g[3]-g[0],k=g[0],g[0]!==g[1]&&(k+=h/f.mUp),l=g[3],g[2]!==g[3]&&(l-=h/f.mDown),m=0,g[0]!==k&&(m+=(k-g[0])*a[e]/2),k!==l&&(m+=(l-k)*a[e]),l!==g[3]&&(m+=(g[3]-l)*a[e]/2),j=l-k,n=h/3*(i+2*j)/(j+i),p=k+(l-k)/2,q=g[0]+(g[3]-g[0])/2,r=0,0!==p-q&&(r=h/(p-q)),o=q,0!==r&&(o+=n/r),c+=m*o,d+=m;return 0===d?0:c/d},takeMaxOfArraySet:function(a){var c,b=[];for(c=a.length-1;c>=0;c-=1)b[c]=this.takeMaxOfArray(a[c]);return b},takeMaxOfArray:function(a){var c,b=a[0];for(c=1;a.length>c;c+=1)b=a[c]>b?a[c]:b;return b}},a}();
var rules = require('./fuzzy_logic-rules');

/**
 * Sr.No
 * 1) 
 * IF PageSize=Excellent AND RequestNb=Excellent AND DOMsize=Excellent then Sustainability is Excellent
 * IF Size=MEDIUM AND RequestNb= Medium AND DOMsize= Medium then Green
 * IF Size=MEDIUM AND RequestNb= Medium AND DOMsize= Bad then Not Green
*/

function main(){
    data = {
        min : 0,
        aver : 20,
        ecar : 5,
        max : 50
    }

    let fuzzyvalue = getFuzzyValue(10,data);

    // WTF ?
    var resGrade = fuzzylogic.grade(3,0,1);
    console.log(resGrade)

    let real_fuzzyvalue = rules.and(fuzzyvalue_pageSize, requestNb, (),())

}

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

main();