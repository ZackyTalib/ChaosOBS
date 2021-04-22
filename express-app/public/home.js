let messageCount = 0;
let messages = [];
let message;
let id;
let chatId;
let chatInitial = false;
let tierColors = [
    ["#1565c0", "", "rgb(255 255 255 / 70%)", "#ffffff"],
    ["#00b8d4", "#00e5ff", "#000000", "#000000"],
    ["#00bfa5", "#1de9b6", "#000000", "#000000"],
    ["#ffb300", "#ffca28", "#000000", "#000000"],
    ["#e65100", "#f57c00", "rgb(255 255 255 / 70%)", "#ffffff"],
    ["#c2185b", "#e91e63", "rgb(255 255 255 / 70%)", "#ffffff"],
    ["#d00000", "#e62117", "rgb(255 255 255 / 70%)", "#ffffff"]
  ];
  

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

    if(element.parentElement.id.charAt(0) == "m"){
        message = messages[parseInt(element.parentElement.id.substring(7))];
    } else {
        message = messages[parseInt(element.parentElement.id.substring(9))];
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/setComment", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() { 
        if (xhr.readyState == 4 && xhr.status == 200)
            console.log(xhr.responseText);
    }
    xhr.send(JSON.stringify(message));
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
            chatInitial = false;
            makeInvisible();
            startChats();
        }
    }
    xmlHttp.open("GET", "/setStream?id=" + id, true);
    xmlHttp.send(null);
}

function createMessage(name, comment, pfp, status){
    messages.push({name: name, comment: comment, pfp: pfp, status: status, superchat: "false"});

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

    if(status == "owner"){
        nameNode.classList.add("ownerMessage");
    }
    
    let commentNode = document.createElement("span");
    commentNode.innerHTML = comment;
    
    let button = document.createElement("button");
    button.innerHTML = "Select";
    button.setAttribute("onclick", "selectMessage(this)");
    button.classList.add("unselected");
    
    textNode.appendChild(nameNode);
    if(status == "moderator"){
        nameNode.classList.add("moderatorMessage");
        let modIcon = document.createElement("img");
        modIcon.src = "/modicon";
        modIcon.classList.add("modIcon");
        textNode.appendChild(modIcon);
    }
    if(status == "sponsor"){
        let sponsorIcon = document.createElement("img");
        sponsorIcon.src = "/membericon";
        sponsorIcon.classList.add("modIcon");
        textNode.appendChild(sponsorIcon);
    }
    textNode.appendChild(commentNode);
    
    messageNode.appendChild(image);
    messageNode.appendChild(textNode);
    messageNode.appendChild(button)
    
    document.querySelector(".content").appendChild(messageNode);
    messageCount++;
}

function createSuperchat(name, amount, comment, tier, pfp){
    messages.push({name: name, amount: amount, comment: comment, tier: tier, pfp: pfp, status: "normal", superchat: "true"});

    let superchat = document.createElement("div");
    superchat.setAttribute("id", "superchat" + messageCount);
    superchat.classList.add("superchat");
    
    let superchatPfp = document.createElement("img");
    superchatPfp.classList.add("superchatPfp");
    superchatPfp.src = pfp;
    
    let superchatDetails = document.createElement("div");
    superchatDetails.classList.add("superchatDetails");
    
    let superchatName = document.createElement("span");
    superchatName.classList.add("superchatName");
    superchatName.innerHTML = name;
    
    let linebreak = document.createElement("br");
    let superchatAmount = document.createElement("span");
    superchatAmount.classList.add("superchatAmount");
    superchatAmount.innerHTML = amount;
    
    let superchatContent = document.createElement("div");
    superchatContent.classList.add("superchatContent");
    let superchatText = document.createElement("p");
    superchatText.classList.add("superchatText");
    superchatText.innerHTML = comment;
    
    let button = document.createElement("button");
    button.classList.add("superchatButton");
    button.classList.add("unselected");
    button.setAttribute("onclick", "selectMessage(this)");
    button.innerHTML = "Select";

    superchat.appendChild(superchatPfp);
    
    superchatDetails.appendChild(superchatName);
    superchatDetails.appendChild(linebreak);
    superchatDetails.appendChild(superchatAmount)
    
    superchat.appendChild(superchatDetails)
      
    superchatContent.appendChild(superchatText);
    superchat.appendChild(superchatContent);

    superchat.appendChild(button);
    
    document.querySelector(".content").appendChild(superchat);
    
      let colorConfig;
      if(tier > 7){
          colorConfig = tierColors[6];
      } else {
          colorConfig = tierColors[tier - 1];
      }
    
    setTier(colorConfig, messageCount);
            
    if(comment === undefined){
      superchatContent.style.display = "none";
    }
    messageCount++;
  }

function setTier(colorConfig, superchatId){
    let superchatDiv = document.getElementById("superchat" + superchatId);
    superchatDiv.style.backgroundColor = colorConfig[0];
    superchatDiv.children[2].style.backgroundColor = colorConfig[1];
    superchatDiv.children[1].children[0].style.color = colorConfig[2];
    superchatDiv.children[1].children[2].style.color = colorConfig[3];
    superchatDiv.children[2].children[0].style.color = colorConfig[3];
    if(colorConfig[1] == ""){
      superchatDiv.children[2].style.display = "none";
    }
  }

function getChats(callback)
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", "/getChat?id=" + id, true);
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
            if(data.errors != undefined){
                if(data.errors[0].message.errors != undefined){
                    console.log(data);
                    alert("Error: " + data.errors[0].message.errors[0].message);
                } else {
                    console.log(data);
                    alert("Error: " + data.errors[0].message);
                }
            }
            for(i=messageCount; i<data.length; i++){
                if(data[i].superchat == "true"){
                    createSuperchat(data[i].name, data[i].amount, data[i].comment, data[i].tier, data[i].pfp);
                } else {
                    //createSuperchat(data[i].name, "$19.99", data[i].comment, 8, data[i].pfp);
                    createMessage(data[i].name, data[i].comment, data[i].pfp, data[i].status);
                }
            }
        });
    }
    
    setInterval(() => {
        getChats((res) => {
            let data = JSON.parse(res);
            for(i=messageCount; i<data.length; i++){
                createMessage(data[i].name, data[i].comment, data[i].pfp, data[i].status);
            }
        })},
        5000
    );
}