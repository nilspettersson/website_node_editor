/*Global node variables*/
let nodeCount = 0;

window.addEventListener('load', (event) => {
    let nodes = []
    nodes.push(new NodeText(60, 60));
    nodes.push(new NodeText(280, 60));
});

document.onmousemove = function(e){
    if(NodeBase.mouseDown && NodeBase.currentNode != null){
        let editorOffset = document.getElementById("editor").getBoundingClientRect().y;

        let node = document.getElementById("node" + NodeBase.currentNode.id);
        let nodeX = node.getBoundingClientRect().x;
        let nodeY = node.getBoundingClientRect().y;

        let x = e.pageX;
        let y = e.pageY;

        if(NodeBase.dragSetup){
            NodeBase.offsetX = nodeX - x;
            NodeBase.offsetY = nodeY - y;
            NodeBase.dragSetup = false;
        }

        node.style.left = (x + NodeBase.offsetX) + "px";
        node.style.top = (y + NodeBase.offsetY - editorOffset) + "px";
    }
}

class NodeBase{
    static mouseDown = false;
    static lastMouseX = 0;
    static lastMouseY = 0;
    static offsetX = 0;
    static offsetY = 0;
    static dragSetup = false;
    static currentNode = null;

    constructor(x, y, type){
        this.id = nodeCount;
        this.nodes = [];

        this.selected = false;

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
        /*node.onmousedown = function(e){mouseDown(this)}
        node.onmouseup = function(e){mouseUp(this, nodeId)}*/

        let header = document.createElement("div");
        header.id = "header" + this.id;
        header.classList.add("header");
        header.classList.add("node-" + type);
        header.onmousedown = (e) => {
            NodeBase.lastMouseX = e.x;
            NodeBase.lastMouseY = e.y;
            NodeBase.mouseDown = true;
            NodeBase.dragSetup = true;
            NodeBase.currentNode = this;
        }
        header.onmouseup = (e) => {
            NodeBase.mouseDown = false;
        }
        /*header.onmousedown = function(e){
            console.log(this);
        }
        header.onmouseup = function(e){

        }*/

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


//gets the children with class
function getChildNodes(parent, className){
    var children = [];
    for (var i = 0; i < parent.childNodes.length; i++) {
        if(parent.childNodes[i].nodeType == Node.ELEMENT_NODE){
            if (parent.childNodes[i].className.includes(className)) {
                children.push(parent.childNodes[i]);
            }  
        }      
    }
    return children;
}

//gets all children
function getChildNodes(parent){
    var children = [];
    for (var i = 0; i < parent.childNodes.length; i++) {
        if(parent.childNodes[i].nodeType == Node.ELEMENT_NODE){
            children.push(parent.childNodes[i]);
        }      
    }
    return children;
}