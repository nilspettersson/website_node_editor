/*Global node variables*/
let nodeCount = 0;
let editorDrag = false;

let output;
let nodes;

let editorCanvas;

window.addEventListener('load', (event) => {
    editorCanvas = new EditorCanvas();

    nodes = [];
    nodes.push(new NodeOutput(400, 120));
    output = nodes[0];
    /*let div = new NodeDiv(260, 60);
    div.addChild(new NodeText(30, 80));
    output.addChild(div);*/

    output.getHtml();

    drawLines();
    

    document.getElementById("editor").onmousedown = function(e){
        if(NodeBase.mouseDown == false){
            NodeBase.lastMouseX = e.x;
            NodeBase.lastMouseY = e.y;
            editorDrag = true;
        }
        document.getElementById("add-content").classList.remove("dropdown-content-click");
    }

    document.getElementById("editor").onmouseup = function(e){
            editorDrag = false;
            NodeBase.connectParent = null;
            drawLines();
            output.getHtml();
    }

});

document.onkeyup = function(e){
    output.getHtml();
}

document.onmousemove = function(e){
    //if mouse down on input node reate line from input to mouse position.
    if(NodeBase.connectParent != null){
        let node = document.getElementById("node" + NodeBase.connectParent.id);
        let input = node.getElementsByClassName("node-input")[NodeBase.connectParent.nodes.length];

        let startX = input.getBoundingClientRect().x;
        let startY = input.getBoundingClientRect().y + input.getBoundingClientRect().height / 2;

        drawLines();

        editorCanvas.drawLine(startX, startY, e.x, e.y);
    }
    //drag selected node.
    else if(NodeBase.mouseDown && NodeBase.currentNode != null){
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

        drawLines();
    }
    //drag editor.
    else if(editorDrag){
        let nodes = document.getElementsByClassName("node");

        let x = e.pageX;
        let y = e.pageY;
        
        for(let i = 0; i < nodes.length; i++){
            

            //removes the px to get the location of the node
            let nodeX = nodes[i].style.left.replace("px", "");
            let nodeY = nodes[i].style.top.replace("px", "");

            let newX = parseInt(nodeX) + (x - NodeBase.lastMouseX);
            let newY = parseInt(nodeY) + (y - NodeBase.lastMouseY);


            nodes[i].style.left = (newX) + "px";
            nodes[i].style.top = (newY) + "px";
        }
        NodeBase.lastMouseX = x;
        NodeBase.lastMouseY = y;

        drawLines();
    }

}

function drawLines(){
    editorCanvas.clear();

    for(let i = 0; i < nodes.length; i++){
        nodes[i].drawLines();
    }
}

//used to draw lines between nodes.
class EditorCanvas{
    constructor(){
        this.canvas = document.getElementById("canvas");
        this.g = canvas.getContext("2d");
    }

    clear(){
        this.g.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawLine(x1, y1, x2, y2){
        let editor = document.getElementById("editor");
        let editorBox = editor.getBoundingClientRect();

        this.g.strokeStyle = "gray";
        this.g.beginPath();
        this.g.moveTo(x1, y1 - editorBox.y);
        this.g.lineTo(x2, y2 - editorBox.y);
        this.g.stroke();
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

    static connectParent = null;
    

    constructor(x, y, type){
        this.id = nodeCount;
        this.type = type;
        this.nodes = [];

        this.selected = false;

        this.initElement(x, y, type);

        nodeCount++;
    }

    //add child will add child node and add a input for the next child node.
    addChild(node){
        this.addComponent(this.input(nodes.length));
        this.nodes.push(node);
    }

    getHtml(){
        //we get all components with class: render.
        let parent = document.getElementById("content" + this.id);
        let children = getChildNodesByClassName(parent, "render");

        let html = "";
        if(this.type == "div"){
            html += "<div>";
            for(let i = 0; i < this.nodes.length; i++){
                html += this.nodes[i].getHtml();
            }
            html += "</div>";
        }

        for(let i = 0; i < children.length; i++){
            let tagType = children[i].getAttribute("data-tagType");

            html += "<" + tagType + ">" + children[i].value + "</" + tagType + ">";

            //html = html.replaceAll("\n", "<br>");
        }

        return html;
        
    }

    //draws lines between parent and child nodes.
    drawLines(){
        for(let i = 0; i < this.nodes.length; i++){
            let node = document.getElementsByClassName("input" + this.id)[i];

            let startX = node.getBoundingClientRect().x;
            let startY = node.getBoundingClientRect().y + node.getBoundingClientRect().height / 2;

            let childNode = document.getElementById("node" + this.nodes[i].id);
            let endX = childNode.getBoundingClientRect().x + childNode.getBoundingClientRect().width;
            let endY = childNode.getBoundingClientRect().y + 20;
            editorCanvas.drawLine(startX, startY, endX, endY);

            this.nodes[i].drawLines();
        }
    }

    initElement(x, y, type){
        let nodeId = this.id;

        let node = document.createElement("div");
        node.id = "node" + this.id;
        node.style.left = x + "px";
        node.style.top = y + "px";
        node.classList.add("node");
        node.onmousedown = (e) => {
            //if input node is selected do not move node.
            if(NodeBase.connectParent != null){
                return;
            }
            NodeBase.lastMouseX = e.x;
            NodeBase.lastMouseY = e.y;
            NodeBase.mouseDown = true;
            NodeBase.dragSetup = true;
            NodeBase.currentNode = this;
        }
        node.onmouseup = (e) => {
            NodeBase.mouseDown = false;
        }

        let header = document.createElement("div");
        header.id = "header" + this.id;
        header.classList.add("header");
        header.classList.add("node-" + type);
        /*header.onmousedown = (e) => {
            NodeBase.lastMouseX = e.x;
            NodeBase.lastMouseY = e.y;
            NodeBase.mouseDown = true;
            NodeBase.dragSetup = true;
            NodeBase.currentNode = this;
        }
        header.onmouseup = (e) => {
            NodeBase.mouseDown = false;
        }*/
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
        
        output.onmouseup = (e) =>{
            if(NodeBase.connectParent != null){
                NodeBase.connectParent.addChild(this);
            }
        }

        node.append(header);
        node.append(content);
        if(this.type != "output"){
            node.append(output);
        }       

        document.getElementById("editor").append(node);
    }

    addComponent(component, render){
        if(render == true){
            component.classList.add("render");
        }
        document.getElementById("content" + this.id).append(component);
    }

    textarea(tagType){
        let text = document.createElement("textarea");
        text.classList.add("node-textarea");
        text.setAttribute("data-tagType", tagType);
        text.spellcheck = false;
        return text;
    }

    input(index){
        let input = document.createElement("div");
        input.classList.add("node-input");
        input.classList.add("input" + this.id);
    
        let dot = document.createElement("div");
        dot.classList.add("dot");
        input.append(dot);

        let nodeId = this.id;
        dot.onmousedown = (e) =>{
            NodeBase.connectParent = this;
        }

        return input;
    }
}

class NodeText extends NodeBase{
    constructor(x, y){
        super(x, y, "text");
        this.addComponent(this.textarea("p"), true);
    }
}

class NodeDiv extends NodeBase{
    constructor(x, y){
        super(x, y, "div");
        this.addComponent(this.input(0), false);
    }
}

class NodeOutput extends NodeBase{
    constructor(x, y){
        super(x, y, "output");
        this.addComponent(this.input(0), false);
    }

    getHtml(){
        let children = getChildNodes(document.getElementById("content" + this.id), "render");

        let html = "";
        for(let i = 0; i < this.nodes.length; i++){
            html += this.nodes[i].getHtml();
        }


        let website = '<!DOCTYPE html> \n' +
        '<html lang="en"> \n'+
        '<head> \n &emsp; <title>website</title> \n &emsp; <style></style> \n </head> \n'+
        '<body> \n' + html + '\n </body>'+
        '\n </html>';
        let viewer = document.getElementById("viewer");
        viewer.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(website);


        html = html.replaceAll("<", "&lt;");
        html = html.replaceAll(">", "&gt;");
        html = html.replaceAll("\n", "<br>");

        let code = document.getElementById("code");
        code.innerHTML = html;
        
    }
    
}


//switch from vertical or horizontal view
function setVertical(){
    let container = document.getElementById("container");
    container.classList.replace("panel-horizontal", "panel-vertical");

    let view = document.getElementById("view");
    view.classList.replace("panel-vertical", "panel-horizontal");

    initPanels();
}

function setHorizontal(){
    let container = document.getElementById("container");
    container.classList.replace("panel-vertical", "panel-horizontal");

    let view = document.getElementById("view");
    view.classList.replace("panel-horizontal", "panel-vertical");

    initPanels();
}


//gets the children with class
function getChildNodesByClassName(parent, className){
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

function addDropdownClick(e){
    document.getElementById("add-content").classList.toggle("dropdown-content-click");
}

function addNewNode(type){
    let node = null;
    if(type == "div"){
        node = new NodeDiv(0, 0);
    }
    else if(type == "text"){
        node = new NodeText(0, 0);
    }
    NodeBase.lastMouseX = 0;
    NodeBase.lastMouseY = 0;
    NodeBase.mouseDown = true;
    NodeBase.dragSetup = true;
    NodeBase.currentNode = node;
    nodes.push(node);

    document.getElementById("add-content").classList.remove("dropdown-content-click");
}