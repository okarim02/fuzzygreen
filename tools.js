sqlSyntax: [
  
].map(e=>e.toUpperCase)
var tools = module.exports = {
    image : [
      'image/png',
      'image/jpeg',
      'image/png',
      'image/tiff'
    ],
    
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
    }

}



