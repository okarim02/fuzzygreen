const fs = require('fs');
const vm = require('vm'); // Correct syntax error 
const dns = require('dns'); // Find ip

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
    readPixels : function(name){
      // install png-js
      var PNG = require('png-js');
      PNG.decode(name, function(pixels) {
        // pixels is a 1d array (in rgba order) of decoded pixel data
    });
    },
    getIp : function(domain){
      return new Promise((resolve, reject)=>{
        dns.resolve4(domain,(err, addresses) => {
          if(err){
            return reject(err);
          }
          resolve(addresses[0]);
        });
      })
     
    },
    checkIfSocialButton : async(url)=>{
      if (url.includes("platform.twitter.com/widgets.js")) return "tweeter";
      if (url.includes("platform.linkedin.com/in.js")) return "linkedin"; 
      if (url.includes("assets.pinterest.com/js/pinit.js")) return "pinterest";
      if (url.includes("connect.facebook.net") && url.includes("sdk.js")) return "facebook";
      return "";
    },
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
    // delete it 
    hasSQLinsideLoop: async function hasSQLinsideLoop(content){
      var result,indices=[];
      for(let i = 0 ; i < sqlSyntax.length;i++){
        const find = content.search(sqlSyntax[i]);
        if(find!=-1){
          // Search the next neighboor ?
          
        }
      }

    },
    // The sync way
    writeToFile : function writeToFile(name,json_toWrite) {
        fs.writeFileSync(name, "\n\n"+json_toWrite, function (err) {
          if (err) throw err;
          console.log('Saved!');
        });
    },
    readFile : async function readFile(name){
        await fs.readFileSync(name,function(err,data){
          if (!err) {
              return data;
          } else {
              console.log(err);
              return "";
          }
        });
    },
    getFileSize : async (url)=>{
      let file_size = await file_size_url(url).then(console.log).catch(console.error);
    }
}


