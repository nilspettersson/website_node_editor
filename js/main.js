/*Global node variables*/
let nodeCount = 0;
let editorDrag = false;

let css = "";

let nodes;
let editorCanvas;

window.addEventListener('load', (event) => {
    editorCanvas = new EditorCanvas();

    nodes = [];
    nodes.push(new NodeOutput(450, 120));
    nodes.push(new NodeDiv(230, 220));
    nodes.push(new NodeButton(10, 220));
    nodes.push(new NodeStyleManager(240, 80));
    nodes.push(new NodeStyle(10, 0));

    nodes[0].getHtml();

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
            nodes[0].getHtml();
    }

    document.onkeydown = function(e){
        //removes selected node.
        if(e.key == "Delete" && NodeBase.currentNode.type != "output"){
            let id = NodeBase.currentNode.id;
            document.getElementById("node" + id).remove();

            if(NodeBase.currentNode.parent != null){
                let index = NodeBase.currentNode.parent.nodes.indexOf(NodeBase.currentNode);

                for(let i = 0; i < NodeBase.currentNode.nodes.length; i++){
                    NodeBase.currentNode.nodes[i].parent = null;
                    nodes.push(NodeBase.currentNode.nodes[i]);
                }
                console.log(index);
                let parentId = NodeBase.currentNode.parent.id;
                let last = NodeBase.currentNode.parent.nodes.length - 1;
                document.getElementsByClassName("node-all-input-types" + parentId)[last].remove();

                NodeBase.currentNode.parent.nodes.splice(index, 1);
            }
            else{
                let index = nodes.indexOf(NodeBase.currentNode);
                
                nodes.splice(index, 1);
            }
        }

        drawLines();
        nodes[0].getHtml();
    }
});



document.onkeyup = function(e){
    nodes[0].getHtml();
}

document.onmousemove = function(e){
    //if mouse down on input node create line from input to mouse position.
    if(NodeBase.connectParent != null){
        let node = document.getElementById("node" + NodeBase.connectParent.id);
        let input = node.getElementsByClassName("node-" + NodeBase.connectType)[node.getElementsByClassName("node-" + NodeBase.connectType).length - 1];

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
    static connectType = "";
    
    constructor(x, y, parent, type){
        this.id = nodeCount;
        this.type = type;
        this.parent = parent;
        this.nodes = [];
        this.initElement(x, y, type);

        nodeCount++;
    }

    //add child will add child node and add a input for the next child node.
    addChild(node){
        if(node.type == "script"){
            node.parent = this;
            this.addComponent(this.inputScript(), "event");
            this.nodes.push(node);
        }
        else if(node.type == "style-manager"){
            node.parent = this;
            this.addComponent(this.inputStyleManager(), "event");
            this.nodes.push(node);
        }
        else if(node.type == "style"){
            node.parent = this;
            this.addComponent(this.inputStyle(), "event");
            this.nodes.push(node);
        }
        else{
            node.parent = this;
            this.addComponent(this.input(nodes.length));
            this.nodes.push(node);
        }
        
    }

    getHtml(){
        let html = "";

        let parent = document.getElementById("content" + this.id);
        //add event attribute. gets all input components with type event to add event atributes to node.
        let events = "";
        let scriptEvents = getChildNodesByClassName(parent, "event");
        for(let i = 0; i < scriptEvents.length; i++){
            let event = scriptEvents[i].getElementsByTagName("select")[0].value;
            events += ' ' + event + '="event' + this.id + i + '(this)"';
            
        }

        //gets the class name  from component.
        let classes = getChildNodesByClassName(parent, "class");
        let hasClass = false;
        if(classes.length == 1){
            let atribute = classes[0].value;
            if(atribute != "none"){
                hasClass = true;
            }
        }
        let classList = "";
        if(hasClass){
            classList = 'class="';
            for(let i = 0; i < classes.length; i++){
                let atribute = classes[i].value;
                if(atribute != "none"){
                    classList += atribute + ' ';
                }
                
            }
            classList += '"';
        }
        

        
        //we get all components with class: render.
        let children = getChildNodesByClassName(parent, "render");
        for(let i = 0; i < children.length; i++){
            //get tag type fom data-tagType.
            let tagType = children[i].getAttribute("data-tagType");
            if(tagType == "div"){
                html += "<" + tagType + " " + classList + " " + events + ">";
                for(let i = 0; i < this.nodes.length; i++){
                    html += this.nodes[i].getHtml();
                }
                html += "</" + tagType + ">";
            }
            else{
                html += "<" + tagType + " " + classList + " " + events + ">" + children[i].value + "</" + tagType + ">";
            }
        }
        
        return html;
    }

    //adds the javascript code to script tag. 
    getScript(){
        let script = "";
        let parent = document.getElementById("content" + this.id);
        //all script children. add functions for events.
        for(let i = 0; i < this.nodes.length; i++){
            if(this.nodes[i].type == "script"){
                script += "function event" + this.id + i + "(event){";
                script += this.nodes[i].getScript();
                script += "}";
            }
        }

        //add script. adds the script content from the child script nodes and puts it in function
        let scripts = getChildNodesByClassName(parent, "render-script");
        for(let i = 0; i < scripts.length; i++){
            script += scripts[i].value;
        }

        return script;
    }

    //adds the javascript code to script tag. 
    getStyle(){
        let style = "";
        let parent = document.getElementById("content" + this.id);
        //all script children. add functions for events.
        for(let i = 0; i < this.nodes.length; i++){
            if(this.nodes[i].type == "style"){
                style += this.nodes[i].getStyle();
            }
        }

        //add script. adds the script content from the child script nodes and puts it in function
        let styles = getChildNodesByClassName(parent, "render-style");
        for(let i = 0; i < styles.length; i++){
            let className = styles[i].getAttribute("data-value");
            css += className + " ";
            style += '.' + className + '{';
            style += styles[i].value;
            style += '} ';
        }

        return style;
    }

    //draws lines between parent and child nodes.
    drawLines(){
        //calculate the amount of nodes of the different types.
        let inputIndex = 0;
        let scriptIndex = 0;
        let styleIndex = 0;
        let styleManagerIndex = 0;
        for(let i = 0; i < this.nodes.length; i++){
            let node;
            //if the child node is a script find the last script input node of parent.
            if(this.nodes[i].type == "script"){
                node = document.getElementsByClassName("input-script" + this.id)[scriptIndex];
                scriptIndex++;
            }
            else if(this.nodes[i].type == "style-manager"){
                node = document.getElementsByClassName("input-style-manager" + this.id)[styleManagerIndex];
                styleManagerIndex++;
            }
            else if(this.nodes[i].type == "style"){
                node = document.getElementsByClassName("input-style" + this.id)[styleIndex];
                styleIndex++;
            }
            //if the child node is a html node find the last input node of parent.
            else{
                node = document.getElementsByClassName("input" + this.id)[inputIndex];
                inputIndex++;
            }

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

        node.onclick = (e) => {
            NodeBase.currentNode = this;
        }

        let header = document.createElement("div");
        header.id = "header" + this.id;
        header.classList.add("header");
        header.classList.add("node-" + type);

        let headerText = document.createElement("p");
        headerText.innerHTML = type;
        header.append(headerText);

        let content = document.createElement("div");
        content.id = "content" + this.id;
        content.classList.add("content");


        let output = document.createElement("div");
        if(type == "style-manager" || type == "style" || type == "script"){
            output.classList.add("output-" + type);
            output.onmouseup = (e) =>{
                if(NodeBase.connectParent != null && NodeBase.connectType == "input-" + type){
                    if(this.parent == null){
                        let index = nodes.indexOf(this);
                        nodes.splice(index, 1);
                        NodeBase.connectParent.addChild(this);
                    }
                }
            }
            output.onmousedown = () => {
                if(this.parent != null){
                    let index = this.parent.nodes.indexOf(this);
                    let parentElement = document.getElementById("node" + this.parent.id);
                    parentElement.getElementsByClassName("node-input-" + type)[0].remove();
                    this.parent.nodes.splice(index, 1);
                    this.parent = null;

                    nodes.push(this);
                }
            }
        }
        else{
            output.classList.add("output");
            output.onmouseup = (e) =>{
                if(NodeBase.connectParent != null && NodeBase.connectType == "input"){
                    if(this.parent == null){
                        let index = nodes.indexOf(this);
                        nodes.splice(index, 1);
                        NodeBase.connectParent.addChild(this);
                    }
                }
            }
            output.onmousedown = () => {
                if(this.parent != null){
                    let index = this.parent.nodes.indexOf(this);
                    let parentElement = document.getElementById("node" + this.parent.id);
                    parentElement.getElementsByClassName("node-input")[0].remove();
                    this.parent.nodes.splice(index, 1);
                    this.parent = null;

                    nodes.push(this);
                }
            }
        }

        node.append(header);
        node.append(content);
        if(this.type != "output"){
            node.append(output);
        }       

        document.getElementById("editor").append(node);
    }

    addComponent(component, type){
        component.classList.add(type);
        document.getElementById("content" + this.id).append(component);
    }

    div(){
        let div = document.createElement("div");
        div.setAttribute("data-tagType", "div");
        div.spellcheck = false;
        return div;
    }

    textarea(tagType){
        let text = document.createElement("textarea");
        text.classList.add("node-textarea");
        text.setAttribute("data-tagType", tagType);
        text.spellcheck = false;
        return text;
    }

    inputField(tagType){
        let text = document.createElement("input");
        text.classList.add("node-input-field");
        text.setAttribute("data-tagType", tagType);
        text.spellcheck = false;
        return text;
    }

    input(index){
        let input = document.createElement("div");
        input.classList.add("node-input");
        input.classList.add("input" + this.id);
        input.classList.add("node-all-input-types" + this.id);
    
        let dot = document.createElement("div");
        dot.classList.add("dot");
        input.append(dot);

        let nodeId = this.id;
        dot.onmousedown = (e) =>{
            NodeBase.connectParent = this;
            NodeBase.connectType = "input";
        }

        return input;
    }

    inputScript(){
        let input = document.createElement("div");
        input.classList.add("node-input-script");
        input.classList.add("input-script" + this.id);
        input.classList.add("node-all-input-types" + this.id);

        let dropdown = this.dropdown(Array("onclick", "onchange", "onmouseout", "onmouseover", "onkeydown"));
        input.append(dropdown);

        let dot = document.createElement("div");
        dot.classList.add("dot");
        input.append(dot);
        dot.onmousedown = (e) =>{
            NodeBase.connectParent = this;
            NodeBase.connectType = "input-script";
        }

        return input;
    }

    inputStyle(){
        let input = document.createElement("div");
        input.classList.add("node-input-style");
        input.classList.add("input-style" + this.id);
        input.classList.add("node-all-input-types" + this.id);

        let dropdown = this.dropdown(Array("default", "max-width:1600", "max-width:1400", "max-width:1200", "max-width:1000", "max-width:800", "max-width:600", "max-width:400"));
        input.append(dropdown);

        let dot = document.createElement("div");
        dot.classList.add("dot");
        input.append(dot);
        dot.onmousedown = (e) =>{
            NodeBase.connectParent = this;
            NodeBase.connectType = "input-style";
        }

        return input;
    }

    inputStyleInherit(){
        let input = document.createElement("div");
        input.classList.add("node-input-style-inherit");
        input.classList.add("input-style-inherit" + this.id);
        input.classList.add("node-all-input-types" + this.id);

        let dot = document.createElement("div");
        dot.classList.add("dot");
        input.append(dot);
        dot.onmousedown = (e) =>{
            NodeBase.connectParent = this;
            NodeBase.connectType = "input-style";
        }

        return input;
    }

    inputStyleManager(){
        let input = document.createElement("div");
        input.classList.add("node-input-style-manager");
        input.classList.add("input-style-manager" + this.id);

        let dot = document.createElement("div");
        dot.classList.add("dot");
        input.append(dot);
        dot.onmousedown = (e) =>{
            NodeBase.connectParent = this;
            NodeBase.connectType = "input-style-manager";
        }

        return input;
    }

    dropdown(items){
        let dropdown = document.createElement("select");
        dropdown.classList.add("node-dropdown");

        for(let i = 0; i < items.length; i++){
            let item = document.createElement("option");
            if(i == 0){
                item.selected = true;
            }
            item.classList.add("dropdown-item");
            item.value = items[i];
            item.innerHTML = items[i];
            dropdown.append(item);
        }
        return dropdown;
    }

    dropdownClassSelector(items){
        let dropdown = document.createElement("select");
        dropdown.classList.add("node-dropdown");

        let item = document.createElement("option");
        item.classList.add("dropdown-item");
        item.selected = true;
        item.value = "none";
        item.innerHTML = "none";
        dropdown.append(item);


        dropdown.onmousedown = (e) => {
            let selected = -1;
            let options = dropdown.getElementsByClassName("dropdown-item");
            for(let i = 0; i < options.length; i++){
                if(options[i].selected == true){
                    selected = i;
                    console.log(selected);
                    break;
                }
            }


            dropdown.innerHTML = "";

            let item = document.createElement("option");
            item.classList.add("dropdown-item");
            if(selected == -1){
                item.selected = true;
            }
            item.value = "none";
            item.innerHTML = "none";
            dropdown.append(item);

            let classes = css.split(' ');
            for(let i = 0; i < classes.length - 1; i++){
                let item = document.createElement("option");
                if(i == selected - 1){
                    item.selected = true;
                }
                item.classList.add("dropdown-item");
                item.value = classes[i];
                item.innerHTML = classes[i];
                dropdown.append(item);
            }
        }

        let classes = css.split(' ');
        for(let i = 0; i < classes.length - 1; i++){
            let item = document.createElement("option");
            if(i == 0){
                item.selected = true;
            }
            item.classList.add("dropdown-item");
            item.value = classes[i];
            item.innerHTML = classes[i];
            dropdown.append(item);
        }
        return dropdown;
    }

    dropdownTagSelector(items){
        let dropdown = document.createElement("select");
        dropdown.classList.add("node-dropdown");

        //set the data-tagtype of nexr component.
        dropdown.onchange = (e) => {
            dropdown.nextSibling.setAttribute("data-tagType", dropdown.value);
        }

        for(let i = 0; i < items.length; i++){
            let item = document.createElement("option");
            if(i == 0){
                item.selected = true;
            }
            item.classList.add("dropdown-item");
            item.value = items[i];
            item.innerHTML = items[i];
            dropdown.append(item);
        }
        return dropdown;
    }

    //input field that gives its value to sibling, data-value
    inputFieldData(){
        let text = document.createElement("input");
        text.classList.add("node-input-field");
        text.spellcheck = false;

        //set the data-value of next component.
        text.onchange = (e) => {
            text.nextSibling.setAttribute("data-value", text.value);
        }
        return text;
    }

}

class NodeText extends NodeBase{
    constructor(x, y, parent){
        super(x, y, parent, "text");
        this.addComponent(this.dropdownClassSelector(), "class");
        this.addComponent(this.textarea("p"), "render");
    }
}

class NodeHeader extends NodeBase{
    constructor(x, y, parent){
        super(x, y, parent, "header");
        this.addComponent(this.dropdownClassSelector(), "class");
        this.addComponent(this.dropdownTagSelector(Array("h1", "h2", "h3", "h4", "h5")), "render-none");
        this.addComponent(this.textarea("h1"), "render");
    }
}

class NodeDiv extends NodeBase{
    constructor(x, y, parent){
        super(x, y, parent, "div");
        this.addComponent(this.dropdownClassSelector(), "class");
        this.addComponent(this.div(), "render");
        this.addComponent(this.inputScript(), "event");
        this.addComponent(this.input(), "render-none");
    }
}

class NodeButton extends NodeBase{
    constructor(x, y, parent){
        super(x, y, parent, "button");
        this.addComponent(this.dropdownClassSelector(), "class");
        this.addComponent(this.inputField("button"), "render");
        this.addComponent(this.inputScript(), "event");
    }
}

class NodeScript extends NodeBase{
    constructor(x, y, parent){
        super(x, y, parent, "script");
        this.addComponent(this.textarea("script"), "render-script");
    }
}

class NodeStyleManager extends NodeBase{
    constructor(x, y, parent){
        super(x, y, parent, "style-manager");
        this.addComponent(this.inputStyle(), "event");
    }
}

class NodeStyle extends NodeBase{
    constructor(x, y, parent){
        super(x, y, parent, "style");
        this.addComponent(this.inputFieldData(), "render-none");
        this.addComponent(this.textarea("style"), "render-style");
        this.addComponent(this.inputStyleInherit(), "event");
    }
}

class NodeOutput extends NodeBase{
    constructor(x, y, parent){
        super(x, y, parent, "output");
        this.addComponent(this.inputStyleManager(), "render-none");
        this.addComponent(this.input(), "render-none");
    }

    getHtml(){
        let html = "";
        let script = "";
        let style = "";
        css = "";
        
        for(let i = 0; i < this.nodes.length; i++){
            html += this.nodes[i].getHtml();
            script += this.nodes[i].getScript();
            style += this.nodes[i].getStyle();
        }


        let website = '<!DOCTYPE html> \n' +
        '<html lang="en"> \n'+
        '<head> \n &emsp; <title>website</title> \n &emsp; <style>' + style + '</style> \n </head> \n'+
        '<body> \n' + html + '\n '+ '<script>' + script + '</script> \n' + '</body>'+
        '\n </html>';
        let viewer = document.getElementById("viewer");
        viewer.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(website);


        html = html.replaceAll("<", "&lt;");
        html = html.replaceAll(">", "&gt;");
        html = html.replaceAll("\n", "<br>");

        let code = document.getElementById("code");
        code.innerHTML = html + "style:<br>" + style;        
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
            if (parent.childNodes[i].classList.contains(className)) {
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

function addNewNode(e, type){
    let node = null;
    if(type == "div"){
        node = new NodeDiv(e.x - 90, e.y - 46);
    }
    else if(type == "text"){
        node = new NodeText(e.x - 90, e.y - 46);
    }
    else if(type == "header"){
        node = new NodeHeader(e.x - 90, e.y - 46);
    }
    else if(type == "button"){
        node = new NodeButton(e.x - 90, e.y - 46);
    }
    else if(type == "script"){
        node = new NodeScript(e.x - 90, e.y - 46);
    }
    else if(type == "style manager"){
        node = new NodeStyleManager(e.x - 90, e.y - 46);
    }
    else if(type == "style"){
        node = new NodeStyle(e.x - 90, e.y - 46);
    }
    NodeBase.lastMouseX = 0;
    NodeBase.lastMouseY = 0;
    NodeBase.mouseDown = true;
    NodeBase.dragSetup = true;
    NodeBase.currentNode = node;
    nodes.push(node);

    document.getElementById("add-content").classList.remove("dropdown-content-click");
}