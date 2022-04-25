function test(){
    console.log("Hello this is the function test !");
}

async function exec(){
    let url = document.getElementById("url-enter").value;
    console.log("url:",url)

    const data = {url};

    // for more info : https://developer.mozilla.org/fr/docs/Web/API/Fetch_API/Using_Fetch
    const options = {
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    // endpoint
    const response = await fetch('/api',options);

    const dataJson = await response.json();

    console.log(dataJson.message);

    document.getElementById('result').textContent = JSON.stringify(dataJson.data);


}