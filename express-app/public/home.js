let messageCount = 0;
let messages = [];
let message;
let id;
let chatId;
let chatInitial = false;

function unselectMessage(element){
    element.classList.toggle("selected", false);
    element.classList.toggle("unselected", true);
    element.innerHTML = "Select";
    element.setAttribute("onclick", "selectMessage(this)");
    makeInvisible();
}

function makeInvisible(){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/setComment", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        hide: "true"
    }));
}

function selectMessage(element){
    for(i=1; i<document.getElementsByTagName("button").length; i++){
        document.getElementsByTagName("button")[i].classList.toggle("selected", false);
        document.getElementsByTagName("button")[i].classList.toggle("unselected", true);
        document.getElementsByTagName("button")[i].innerHTML = "Select";
        document.getElementsByTagName("button")[i].setAttribute("onclick", "selectMessage(this)");
    }
    element.classList.toggle("selected", true);
    element.innerHTML = "Unselect";
    element.setAttribute("onclick", "unselectMessage(this)");

    message = messages[parseInt(element.parentElement.id.substring(7))];

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/setComment", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() { 
        if (xhr.readyState == 4 && xhr.status == 200)
            callback(xhr.responseText);
    }
    xhr.send(JSON.stringify({
        name: message.name,
        comment: message.comment,
        pfp: message.pfp
    }));
}

function connect(){
    id = document.getElementById("videoID").value;
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            document.getElementsByClassName("content")[0].innerHTML = "";
            messageCount = 0;
            messages = [];
            chatId = xmlHttp.responseText;
            makeInvisible();
            startChats();
        }
    }
    xmlHttp.open("GET", "/setStream?id=" + id, true);
    xmlHttp.send(null);
}

function createMessage(name, comment, pfp){
    messages.push({name: name, comment: comment, pfp: pfp});

    let messageNode = document.createElement("div");
    messageNode.classList.add("message");
    messageNode.setAttribute("id", "message" + messageCount);
    
    let image = document.createElement("img");
    image.classList.add("profile-pic");
    image.src = pfp;
    
    let textNode = document.createElement("p");
    textNode.classList.add("text");
    
    let nameNode = document.createElement("span");
    nameNode.innerHTML = name;
    
    let commentNode = document.createElement("span");
    commentNode.innerHTML = comment;
    
    let button = document.createElement("button");
    button.innerHTML = "Select";
    button.setAttribute("onclick", "selectMessage(this)");
    button.classList.add("unselected");
    
    textNode.appendChild(nameNode);
    textNode.appendChild(commentNode);
    
    messageNode.appendChild(image);
    messageNode.appendChild(textNode);
    messageNode.appendChild(button)
    
    document.querySelector(".content").appendChild(messageNode);
    messageCount++;
}

function getChats(callback)
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", "/getChat", true);
    xmlHttp.send(null);
}

function startChats(){
    if(chatId==undefined){
        return;
    }
    if(chatInitial == false){
        getChats((res) => {
            chatInitial = true;
            let data = JSON.parse(res);
            for(i=messageCount; i<data.length; i++){
                createMessage(data[i].name, data[i].comment, data[i].pfp);
            }
        });
    }
    
    setInterval(() => {
        getChats((res) => {
            let data = JSON.parse(res);
            for(i=messageCount; i<data.length; i++){
                createMessage(data[i].name, data[i].comment, data[i].pfp);
            }
        })},
        5000
    );
}