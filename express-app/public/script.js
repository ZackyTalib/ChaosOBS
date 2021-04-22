let tierColors = [
    ["#1565c0", "", "rgb(255 255 255 / 70%)", "#ffffff"],
    ["#00b8d4", "#00e5ff", "#000000", "#000000"],
    ["#00bfa5", "#1de9b6", "#000000", "#000000"],
    ["#ffb300", "#ffca28", "#000000", "#000000"],
    ["#e65100", "#f57c00", "rgb(255 255 255 / 70%)", "#ffffff"],
    ["#c2185b", "#e91e63", "rgb(255 255 255 / 70%)", "#ffffff"],
    ["#d00000", "#e62117", "rgb(255 255 255 / 70%)", "#ffffff"]
  ];

function hideSource(){
    document.querySelector(".comment").style.visibility = "hidden";
    document.querySelector(".superchat").style.visibility = "hidden";
}

function setComment(name, comment, pfp){
    document.querySelector(".comment").style.visibility = "visible";
    document.querySelector(".comment .name-box").children[0].innerHTML = name;
    document.querySelector(".comment .comment-box").innerHTML = comment;
    document.querySelector(".pfp-circle img").src = pfp;
}

function setSuperchat(name, amount, comment, pfp, tier){
    document.querySelector(".superchat").style.visibility = "visible";

    let colorConfig;
    if(tier > 7){
        colorConfig = tierColors[6];
    } else {
        colorConfig = tierColors[tier - 1];
    }

    let superchatDiv = document.querySelector(".superchat");

    superchatDiv.children[0].src = pfp;
    superchatDiv.children[1].children[0].innerHTML = name;
    superchatDiv.children[1].children[2].innerHTML = amount;
    superchatDiv.children[2].children[0].innerHTML = comment;

    superchatDiv.style.backgroundColor = colorConfig[0];
    superchatDiv.children[2].style.backgroundColor = colorConfig[1];
    superchatDiv.children[1].children[0].style.color = colorConfig[2];
    superchatDiv.children[1].children[2].style.color = colorConfig[3];
    superchatDiv.children[2].children[0].style.color = colorConfig[3];
    if(colorConfig[1] == "" || comment == undefined){
        superchatDiv.children[2].style.display = "none";
    } else {
        superchatDiv.children[2].style.display = "block";
    }
}

function makeOwner(state){
    document.querySelector(".nameIcon").style.display = "none";
    document.querySelector(".pfp-circle").style.borderColor = "#E02020";
    if(state == "owner"){
        document.querySelector(".nameIcon").src = "/ownericon";
        document.querySelector(".nameIcon").style.display = "block";
        document.querySelector(".pfp-circle").style.borderColor = "#ffd600";
    } if(state == "sponsor"){
        document.querySelector(".nameIcon").src = "/membericon";
        document.querySelector(".nameIcon").style.display = "block";
        document.querySelector(".pfp-circle").style.borderColor = "#ffd600";
    } if(state == "moderator"){
        document.querySelector(".nameIcon").src = "/modicon";
        document.querySelector(".nameIcon").style.display = "block";
        document.querySelector(".pfp-circle").style.borderColor = "hsl(225deg 77% 65%)";
    }
}

var database = firebase.database();

var currentCommentRef = database.ref("currentComment");
currentCommentRef.on('value', (snapshot) => {
    const data = snapshot.val();
    hideSource();
    if(data.visible == "true"){
        if(data.superchat == "true"){
            setSuperchat(data.name, data.amount, data.comment, data.pfp, data.tier);
        } else {
            makeOwner(data.status);
            setComment(data.name, data.comment, data.pfp);
        }
    }
});