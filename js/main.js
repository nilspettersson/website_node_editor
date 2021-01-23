window.addEventListener('load', (event) => {
    


});

//switch from vertical or horizontal view
function setVertical(){
    let container = document.getElementById("container");
    container.classList.replace("panel-horizontal", "panel-vertical");

    initPanels();
}

function setHorizontal(){
    let container = document.getElementById("container");
    container.classList.replace("panel-vertical", "panel-horizontal");

    initPanels();
}