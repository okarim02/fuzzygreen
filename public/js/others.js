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