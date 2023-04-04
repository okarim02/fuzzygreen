function display_loading() {
    let el = document.getElementById('loading');
    el.classList.add("display");
}

function hide_loading() {
    let el = document.getElementById('loading');
    el.classList.remove("display");
}

function show_error(message) {
    let el = document.getElementById('loading');
    alert(message);
}

function show_message(message){
    let el = document.getElementById('message');
    el.innerText = message;
    setTimeout(function() {
        el.innerHTML = "";
    },5000);
}

function isUrl(string) {
    let url_string;
    try {
        url_string = new URL(string);
    } catch (_) {
        return false;
    }
    return url_string.protocol === "http:" || url_string.protocol === "https:";
}