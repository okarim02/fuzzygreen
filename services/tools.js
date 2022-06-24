const vm = require('vm'); // Correct syntax error 
const dns = require('dns'); // Find ip

const fs = require('fs'),
PNG = require('pngjs').PNG

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
      {"WordPress":"wp"},
      {"Wix":""} ,
      {"Squarespace":""} ,
      {"Joomla!":""},
      {"Shopify":""},
      {"Progress":""},
      {"GoDaddy Website Builder":""},
      {"Weebly":"" },
      {"Drupal":"" },
      {"Blogger":""}
    ],
    // @link https://stackoverflow.com/questions/11247790/reading-a-png-image-in-node-js
    // Inspiré de ... 
    readPixels : function(name){
      return new Promise((resolve, reject)=>{
        fs.createReadStream(name)
        .pipe(new PNG())
        .on('parsed', function() {

          this.red = 0;
          this.green = 0;
          this.blue = 0;
          
          for (var y = 0; y < this.height; y++) {
              for (var x = 0; x < this.width; x++) {
                  var idx = (this.width * y + x) << 2;

                  // this.data[idx] = R,this.data[idx+1] = G, this.data[idx+2] = B, this.data[idx+3] = opacity 

                  this.red += this.data[idx]/255;
                  this.green += this.data[idx+1]/255;
                  this.blue += this.data[idx+2]/255

              }
          }

          this.pixelNb = this.height * this.width;

          this.red = this.red / this.pixelNb;
          this.green = this.green / this.pixelNb;
          this.blue = this.blue / this.pixelNb;

          let rgb = [
            this.red,this.green,this.blue
          ]
          
          // Calcule de la luminosité : 
          // source : https://donatbalipapp.medium.com/colours-maths-90346fb5abda#:~:text=The%20formula%20for%20Saturation%20uses,(RGB)%20values%20and%20Luminosity.&text=We%20have%20calculated%20the%20Luminosity,Min(RGB)%20%3D%200%2C212.
          this.luminance =0.5*(Math.max(...rgb)+Math.min(...rgb));

          // Calcule de la saturation
          // if(this.luminance < 1){
          //   this.saturation = (Math.max(...rgb)-Math.min(...rgb)) / (1-Math.abs(2*this.luminance-1));
          // }else if (this.luminance==1){
          //   this.saturation=0;
          // }

          this.luminance*=100;
          this.luminance= this.luminance.toFixed(2);
          // this.saturation*=100;
          // this.saturation = this.saturation.toFixed(2);

          // this.result = (this.luminance * this.saturation);
          console.log("Luminance : ",this.luminance, " %");
          resolve(this.luminance)
        });
      })

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


