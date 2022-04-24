const main = require('../main')

function exec(){
    let url = document.getElementById("url-enter").value;
    main.main(url);
}