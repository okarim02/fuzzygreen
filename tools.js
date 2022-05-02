const fs = require('fs');
const vm = require('vm'); // Correct syntax error 

standard_font : [
  "Courier New",
  "Georgia",
  "Arial",
  "Comic",
  "Impact",
  "Tahoma",
  "Trebuchet MS",
  "Times New Roman",
  "Verdana",
  "Segoe UI"
]

var tools = module.exports = {
    CMS_LIST : [
      "WordPress",
      "Wix" ,
      "Squarespace" ,
      "Joomla!",
      "Shopify",
      "Progress",
      "GoDaddy Website Builder",
      "Weebly" ,
      "Drupal" ,
      "Blogger"
    ],
    checkSyntax: async (content)=>{
      try{
        const script = new vm.Script(content);
      }catch(e){
        return e;
      }
      return "";
    },
    getDomain : async function getDomain(baseUrl){
      return baseUrl.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
    },
    powerByWho : async function powerByWho(content){
      // 
    },
    //numbersOfErrors: async function numbersOfErrors(content){}
    isMinified : async function isMinified(content){    
        if (!content) return true;
        if (content.length === 0) return true;
    
        const total = content.length - 1;
    
        const semicolons = (content.match(/;/g) || []).length
        const linebreaks = (content.match(/\n/g) || []).length
    
        if (linebreaks < 2) return true;
    
        return (semicolons / linebreaks > 1 && linebreaks / total < 0.01);
    },
    hasSQLinsideLoop: async function hasSQLinsideLoop(content){
      var result,indices=[];
      for(let i = 0 ; i < sqlSyntax.length;i++){
        const find = content.search(sqlSyntax[i]);
        if(find!=-1){
          // Search the next neighboor ?
          
        }
      }

    },
    isUrl : function isUrl(string){
        let url_string; 
        try {
          url_string = new URL(string);
        } catch (_) {
          return false;  
        }
        return url_string.protocol === "http:" || url_string.protocol === "https:" ;
    },
    // Think about the sync way
    writeToFile : function writeToFile(name,json_toWrite) {
        fs.appendFile(name, "\n\n"+json_toWrite, function (err) {
          if (err) throw err;
          console.log('Saved!');
        });
    },
    getFileSize : async (url)=>{
      let file_size = await file_size_url(url).then(console.log).catch(console.error);
    }
}


