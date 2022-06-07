const { clust } = require('./cluster');

// to delete 
async function test(){
    let urls = ["https://seo-elp.fr/#/"];
    let crits = [
        "imgResize"
    ];

    let res = await clust(urls,crits);

    console.log("result : ",res);

}
test()