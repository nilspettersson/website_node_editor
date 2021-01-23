/*Global node variables*/
let nodeCount = 0;

window.addEventListener('load', (event) => {
    let node = new NodeText(60, 60);
    let node2 = new NodeText(280, 60);
});

class NodeBase{
    constructor(x, y, type){
        this.id = nodeCount;
        this.nodes = [];
        this.initElement(x, y, type);

        nodeCount++;
    }

    initElement(x, y, type){
        let nodeId = this.id;

        let node = document.createElement("div");
        node.id = "node" + this.id;
        node.style.left = x + "px";
        node.style.top = y + "px";
        node.classList.add("node");
        node.onmousedown = function(e){mouseDown(this)}
        node.onmouseup = function(e){mouseUp(this, nodeId)}

        let header = document.createElement("div");
        header.classList.add("header");
        header.classList.add("node-" + type);

        let headerText = document.createElement("p");
        headerText.innerHTML = type;
        header.append(headerText);

        let content = document.createElement("div");
        content.id = "content" + this.id;
        content.classList.add("content");


        let output = document.createElement("div");
        output.classList.add("output");
        
        output.onmouseup = function(e){outputMouseUp(this, nodeId)}

        node.append(header);
        node.append(content);
        node.append(output);

        document.getElementById("editor").append(node);
    }

    addComponent(component){
        document.getElementById("content" + this.id).append(component);
    }

    textarea(){
        let text = document.createElement("textarea");
        text.classList.add("node-textarea");
        text.spellcheck = false;
        return text;
    }
}

class NodeText extends NodeBase{
    constructor(x, y){
        super(x, y, "text");
        this.addComponent(this.textarea());
    }
}




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
