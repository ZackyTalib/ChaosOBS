function setName(name){
    document.querySelector(".comment .name-box").innerHTML = name;
}
  
function setComment(comment){
    document.querySelector(".comment .comment-box").innerHTML = comment;
}

function setPicture(source){
    document.querySelector(".pfp-circle img").src = source;
}

function hideSource(){
    document.querySelector(".comment").style.visibility = "hidden";
}

function showSource(){
    document.querySelector(".comment").style.visibility = "visible";
}

var database = firebase.database();

var currentCommentRef = database.ref("currentComment");
currentCommentRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if(data.visible == "true"){
        showSource();
    } else {
        hideSource();
    }
    setName(data.name);
    setComment(data.comment);
    setPicture(data.pfp);
});