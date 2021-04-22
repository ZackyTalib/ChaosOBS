let currentComment = {
  pfp: "",
  name: "",
  comment: "",
  status: "normal"
}

let firebase = require("firebase");
require("@firebase/database");

let firebaseConfig = {
  apiKey: "AIzaSyCD1TO-QluSCKZxiRuEDqxD_TCEp2lfChg",
  authDomain: "christopherchaos.firebaseapp.com",
  databaseURL: "https://christopherchaos-default-rtdb.firebaseio.com",
  projectId: "christopherchaos",
  storageBucket: "christopherchaos.appspot.com",
  messagingSenderId: "840957485667",
  appId: "1:840957485667:web:45b3d61c1c14588ba5ce56"
};

firebase.initializeApp(firebaseConfig);

let database = firebase.database();

var currentCommentRef = database.ref("currentComment");
currentCommentRef.on('value', (snapshot) => {
  currentComment = snapshot.val();
});

function updateCurrentComment(commentProperties){
  currentCommentRef.set(commentProperties);
}

const express = require("express"),
  path = require("path"),
  logger = require("morgan"),
  bodyParser = require("body-parser"),
  app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function(req, res) {
  if(oauth2Client.credentials.access_token == undefined){
    setRefreshToken().then((value) => {
        if(value){ 
          res.sendFile(path.join(__dirname, '/public', 'index.html')); 
        }
        else {
            let url = oauth2Client.generateAuthUrl({
              access_type: 'offline',
              scope: scopes
            });
            console.log(".authLink" + url);
            res.sendFile(path.join(__dirname, '/public', 'nonAuth.html')); 
        }
    });
  } else {
    res.sendFile(path.join(__dirname, '/public', 'index.html'));
  }
});

app.get("/test", (req, res) => {
  res.send("Redirected");
});

app.get("/home-css", (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'home.css'));
});

app.get("/home-js", (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'home.js'));
});

app.get("/source", (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'source.html'));
});

app.get("/css", (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'style.css'));
});

app.get("/js", (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'script.js'));
});

app.get("/logo", (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'yt-logo.png'));
});

app.get("/modicon", (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'mod-icon.PNG'));
});

app.get("/ownericon", (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'crown.png'));
});

app.get("/membericon", (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'memberIcon.png'));
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'icon.ico'));
});

app.get("/getComment", (req, res) => {
  res.json(currentComment);
});

app.post("/setComment", (req, res) => {
  if(req.body.hide !== undefined){
      updateCurrentComment({visible: "false"});
  } else {
      let message = req.body;
      message.visible = "true";
      updateCurrentComment(message);
  }
  res.send("received");
});

const {google} = require('googleapis');
const youtube = google.youtube({version: "v3"});

let messages = [];
let liveChatId;
let nextPageToken;
let milis;

const oauth2Client = new google.auth.OAuth2(
  "51739625583-4fad1dac1ak78ts09r82cpp23vf356nj.apps.googleusercontent.com",
  "kJFjo0Nxuc6iJlmCrxgdrgFt",
  "http://localhost:3000/oauth2callback"
);

const scopes = [
  'https://www.googleapis.com/auth/youtube.readonly'
];

app.get("/authenticate", (req, res) => {
  if(oauth2Client.credentials.access_token == undefined){
      setRefreshToken().then((value) => {
          if(value){ res.send("Authenticated"); }
          else {
              res.redirect(oauth2Client.generateAuthUrl({
                  access_type: 'offline',
                  scope: scopes
                }));
          }
      });
  } else {
      res.send("Authorized");
  }
});

app.get("/oauth2callback", (req, res) => {
  setAccessToken(req.query.code).then(() => {
    console.log(".authComp");
    res.send("<h1>You may close this window now</h1>");
  });
});

function setRefreshToken(){
  return new Promise((resolve, reject) => {
      let refreshTokenRef = database.ref("refresh-token");
      refreshTokenRef.get().then((snapshot) => {
          if(snapshot.val() != "-"){
              oauth2Client.setCredentials({
                  refresh_token: snapshot.val()
                });
              return resolve(true);
          } else {
              return resolve(false);
          }
      });
  });
}

async function setAccessToken(code){
  const {tokens} = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
}

async function getBroadcast(id){
  if(oauth2Client.credentials.access_token !== undefined || await setRefreshToken()){
      try{
          let broadcastRequest = await youtube.liveBroadcasts.list({
              auth: oauth2Client,
              part: "snippet,contentDetails,status",
              id: id
          });
          messages = [];

          liveChatId = broadcastRequest.data.items[0].snippet.liveChatId;
          nextPageToken = undefined;
          return {status: true};
      } catch(err) {
          return {status: false, message: err};
      }
  } else {
      return {status: false, message: "Not authorized"};
  }
}

async function getLiveChat(liveChatId){
  if(oauth2Client.credentials.access_token !== undefined || await setRefreshToken()){
      try{
          let chatRequestParams = {
              auth: oauth2Client,
              liveChatId: liveChatId,
              part: "id, snippet, authorDetails"
          };
          if(nextPageToken !== undefined) {chatRequestParams.pageToken = nextPageToken;}
          let chatMessagesRequest = await youtube.liveChatMessages.list(chatRequestParams);

          nextPageToken = chatMessagesRequest.data.nextPageToken;
          milis = chatMessagesRequest.data.pollingIntervalMillis;
          
          let messageList = chatMessagesRequest.data.items;
          //let messageList = [];

          /*
          // Normal Text Message
          let normalTextMessage = {
            "snippet": {
              "hasDisplayContent": true,
              "type": "textMessageEvent",
              "displayMessage": "Hello world this is a test message!"
            },
            "authorDetails": {
              "isChatSponsor": false,
              "isChatModerator": false,
              "isChatOwner": false,
              "displayName": "Zacky VT",
              "profileImageUrl": "https://yt3.ggpht.com/yti/ANoDKi42s1_r8lKyjNm3hdBq3rBZDn6FwnINks0tGJnM2Q=s88-c-k-c0x00ffffff-no-rj-mo"
            }
          };
          messageList.push(normalTextMessage);

          // Owner Text Message
          let ownerTextMessage = {
            "snippet": {
              "hasDisplayContent": true,
              "type": "textMessageEvent",
              "displayMessage": "Hello world this is a test message!"
            },
            "authorDetails": {
              "isChatSponsor": false,
              "isChatModerator": false,
              "isChatOwner": true,
              "displayName": "Zacky VT",
              "profileImageUrl": "https://yt3.ggpht.com/yti/ANoDKi42s1_r8lKyjNm3hdBq3rBZDn6FwnINks0tGJnM2Q=s88-c-k-c0x00ffffff-no-rj-mo"
            }
          };
          messageList.push(ownerTextMessage);

          // Sponsor Text Message
          let sponsorTextMessage = {
            "snippet": {
              "hasDisplayContent": true,
              "type": "textMessageEvent",
              "displayMessage": "Hello world this is a test message!"
            },
            "authorDetails": {
              "isChatSponsor": true,
              "isChatModerator": false,
              "isChatOwner": false,
              "displayName": "Zacky VT",
              "profileImageUrl": "https://yt3.ggpht.com/yti/ANoDKi42s1_r8lKyjNm3hdBq3rBZDn6FwnINks0tGJnM2Q=s88-c-k-c0x00ffffff-no-rj-mo"
            }
          };
          messageList.push(sponsorTextMessage);

          // Moderator Text Message
          let moderatorTextMessage = {
            "snippet": {
              "hasDisplayContent": true,
              "type": "textMessageEvent",
              "displayMessage": "Hello world this is a test message!"
            },
            "authorDetails": {
              "isChatSponsor": false,
              "isChatModerator": true,
              "isChatOwner": false,
              "displayName": "Zacky VT",
              "profileImageUrl": "https://yt3.ggpht.com/yti/ANoDKi42s1_r8lKyjNm3hdBq3rBZDn6FwnINks0tGJnM2Q=s88-c-k-c0x00ffffff-no-rj-mo"
            }
          };
          messageList.push(moderatorTextMessage);

          // Superchat Message
          let superchatMessage = {
            "snippet": {
              "hasDisplayContent": true,
              "type": "superChatEvent",
              "displayMessage": "Hello world this is a test message!",
              "superChatDetails": {
                "userComment": "Hello world this is a test message!",
                "amountDisplayString": "$199.99",
                "tier": 7
              }
            },
            "authorDetails": {
              "isChatSponsor": false,
              "isChatModerator": false,
              "isChatOwner": false,
              "displayName": "Zacky VT",
              "profileImageUrl": "https://yt3.ggpht.com/yti/ANoDKi42s1_r8lKyjNm3hdBq3rBZDn6FwnINks0tGJnM2Q=s88-c-k-c0x00ffffff-no-rj-mo"
            }
          };
          messageList.push(superchatMessage);

          // Super Sticker Message
          let superstickerMessage = {
            "snippet": {
              "hasDisplayContent": true,
              "type": "superStickerEvent",
              "displayMessage": "Hello world this is a test message!",
              "superStickerDetails": {
                "amountDisplayString": "$29.99",
                "tier": 3
              }
            },
            "authorDetails": {
              "isChatSponsor": false,
              "isChatModerator": false,
              "isChatOwner": false,
              "displayName": "Zacky VT",
              "profileImageUrl": "https://yt3.ggpht.com/yti/ANoDKi42s1_r8lKyjNm3hdBq3rBZDn6FwnINks0tGJnM2Q=s88-c-k-c0x00ffffff-no-rj-mo"
            }
          };
          messageList.push(superstickerMessage);
          */

          for(i=0; i<messageList.length; i++){
              console.log(messageList[i]);
              if(messageList[i].snippet.hasDisplayContent){
                console.log("here1");
                let status = "normal";

                if(messageList[i].authorDetails.isChatSponsor){
                  console.log("here11");
                  //console.log(messageList[i].authorDetails.displayName);
                  status = "sponsor";
                }
                if(messageList[i].authorDetails.isChatModerator){
                  console.log("here13");
                  status = "moderator";
                }
                if(messageList[i].authorDetails.isChatOwner){
                  console.log("here14");
                  status = "owner";
                } 

                console.log("here15");

                if(messageList[i].snippet.type == "superChatEvent"){
                  console.log("here16");
                  messages.push({
                    "name": messageList[i].authorDetails.displayName,
                    "comment": messageList[i].snippet.superChatDetails.userComment,
                    "pfp": messageList[i].authorDetails.profileImageUrl,
                    "status": status,
                    "amount": messageList[i].snippet.superChatDetails.amountDisplayString,
                    "tier": messageList[i].snippet.superChatDetails.tier,
                    "superchat": "true"
                  });
                }

                if(messageList[i].snippet.type == "superStickerEvent"){
                  console.log("here17");
                  messages.push({
                    "name": messageList[i].authorDetails.displayName,
                    "pfp": messageList[i].authorDetails.profileImageUrl,
                    "status": status,
                    "amount": messageList[i].snippet.superStickerDetails.amountDisplayString,
                    "tier": messageList[i].snippet.superStickerDetails.tier,
                    "superchat": "true"
                  });
                }

                if(messageList[i].snippet.type == "textMessageEvent"){
                  console.log("here18");
                  messages.push({
                    "name": messageList[i].authorDetails.displayName,
                    "comment": messageList[i].snippet.displayMessage,
                    "pfp": messageList[i].authorDetails.profileImageUrl,
                    "status": status,
                    "superchat": "false"
                  });
                }
              }
          }
          return {status: true};
      } catch(err) {
          return {status: false, message: err};
      }
  } else {
      return {status: false, message: "Not authorized"};
  }
}

oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
      let refreshTokenRef = database.ref("refresh-token");
      refreshTokenRef.set(tokens.refresh_token);
  }
});

app.get("/setStream", (req, res) => {
  getBroadcast(req.query.id).then((success) => {
      if(success.status){
          res.send(liveChatId);
      } else {liveChatId = undefined; res.json({ "errors": [{"message": success.message}] });}
  });
});

app.get("/getChat", (req, res) => {
  if(liveChatId !== undefined){
      getLiveChat(liveChatId).then((nsuccess) => {
          if(nsuccess.status) {
              res.json(messages);
          }
          else {res.json({ "errors": [{"message": nsuccess.message}] });}
      });
  } else {
      if(req.query.id == undefined){ res.json({ "errors": [{"message": "No valid stream ID specified"}] }); return; }
      getBroadcast(req.query.id).then((success) => {
          if(success.status){
              getLiveChat(liveChatId).then((nsuccess) => {
                  if(nsuccess.status) {
                      res.json(messages);
                  }
                  else {liveChatId = undefined; res.json({ "errors": [{"message": nsuccess.message}] });}
              });
          } else {res.json({ "errors": [{"message": success.message}] });}
      });
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
