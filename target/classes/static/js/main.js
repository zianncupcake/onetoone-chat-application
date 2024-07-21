'use strict';

//query selector by id
const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting'); //by classname
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout');

let stompClient = null;
let nickname = null;
let fullname = null;
let selectedUserId = null;

//connect user to websocket
function connect(event) {
    nickname = document.querySelector('#nickname').value.trim();
    fullname = document.querySelector('#fullname').value.trim();

    if (nickname && fullname) {
        //add or remove classes dynamically
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        //create new sockjs object, establish connection to websocket endpoint '/ws'
        const socket = new SockJS('/ws');
        //initialise stomp client over sockjs connection.  STOMP is a simple text-oriented messaging protocol that provides an interoperable wire format.
        stompClient = Stomp.over(socket);
        console.log("stompclient", stompClient)

        //connects stemp client
        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

//callback executed when websocket connection is successfully established
function onConnected() {
    console.log("connection successful")
    //connect user to his own queue. creates unique subscription path for each user --> only receive messages intended for them
    stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
    //subscribe to public message queue
    stompClient.subscribe(`/user/public`, onMessageReceived);

    // register the connected user. sends a message to a specific destination "/app/user.addUser" aka send to usercontroller.
    stompClient.send("/app/user.addUser",
        {},
        JSON.stringify({nickName: nickname, fullName: fullname, status: 'ONLINE'})
    );
    
    //udpate ui with connected user's information --> display the connected user's full name on the web page
    document.querySelector('#connected-user-fullname').textContent = fullname;
    //find and display connected users
    findAndDisplayConnectedUsers().then();
}

async function onMessageReceived(payload) {
    await findAndDisplayConnectedUsers();
    //message is just the chatnotification object
    const message = JSON.parse(payload.body);
    console.log("what is the message", message)
    //if u are currently clicking on the chat with aaron and aaron sends u a message
    if (selectedUserId && selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content);
        //scroll to bottom
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        //active means the white box 
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden');
    }
    //If the user who sent the message is in the list of connected users but is not currently active (i.e., their chat is not open), 
    //the notification count (nbr-msg) is updated to indicate that there are new messages.
    //senderid is the nickname of the sender
    const notifiedUser = document.querySelector(`#${message.senderId}`);
    console.log("the original notified user", notifiedUser)
    console.log("all user items", document.querySelectorAll('.user-item'))
    // console.log("what happens when i do a list", document.querySelectorAll(`#${message.senderId}`) )
    if (notifiedUser && !notifiedUser.classList.contains('active')) {
        const nbrMsg = notifiedUser.querySelector('.nbr-msg');
        nbrMsg.classList.remove('hidden');
        // const currentCount = parseInt(nbrMsg.textContent) || 0;
        // nbrMsg.textContent = currentCount + 1;
        nbrMsg.textContent = '';
    }
}

//basically just formatting the messages in the chat box
function displayMessage(senderId, content) {
    const messageContainer = document.createElement('div');
    //look into main.css. baiscally sender is blue bubble then receiver normal bubble
    messageContainer.classList.add('message');
    if (senderId === nickname) {
        messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('receiver');
    }
    const message = document.createElement('p');
    message.textContent = content;
    messageContainer.appendChild(message);
    //filling up the chatarea with messages
    chatArea.appendChild(messageContainer);
}

//cuz we calling the backend so we need the async
async function findAndDisplayConnectedUsers() {
    //fetch data from server side endpoint --> call user controller.user controller has a mapping
    const connectedUserResponse = await fetch('/users')
    let connectedUsers = await connectedUserResponse.json()
    connectedUsers = connectedUsers.filter(user => user.nickName !== nickname)
    const connectedUsersList = document.getElementById('connectedUsers')
    //clear content in the list element before loading a new one
    connectedUsersList.innerHTML = ''

    connectedUsers.forEach(user => {
        appendUserElement(user,connectedUsersList)

        if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
            //add a separator except for the last item
            const separator = document.createElement('li')
            separator.classList.add('separator')
            connectedUsersList.appendChild(separator)
        }
    })
}

function sendMessage(event) {
    const messageContent = messageInput.value.trim();
    //make sure stompclient doesnt get disconnected
    if (messageContent && stompClient) {
        const chatMessage = {
            senderId: nickname,
            recepientId: selectedUserId,
            content: messageInput.value.trim(),
            timestamp: new Date()
        };
        //send to chat controller
        console.log("Chat message", chatMessage)
        stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
        displayMessage(nickname, messageInput.value.trim());
        messageInput.value = '';
    }
    chatArea.scrollTop = chatArea.scrollHeight;
    event.preventDefault();
}

function appendUserElement(user, connectedUsersList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.nickName;

    const userImage = document.createElement('img');
    userImage.src = '../img/user_icon.png';
    userImage.alt = user.fullName;

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.fullName;

    const receivedMsgs = document.createElement('span');
    receivedMsgs.textContent = '0';
    //adds 2 classes to the span element
    receivedMsgs.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsgs);

    listItem.addEventListener('click', userItemClick);

    connectedUsersList.appendChild(listItem);
}

function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    // Set the selectedUserId to the ID of the clicked user element
    selectedUserId = clickedUser.getAttribute('id');
    fetchAndDisplayUserChat().then();

    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    // nbrMsg.textContent = '0';

}

async function fetchAndDisplayUserChat() {
    const userChatResponse = await fetch(`/messages/${nickname}/${selectedUserId}`);
    const userChat = await userChatResponse.json();
    chatArea.innerHTML = '';
    userChat.forEach(chat => {
        displayMessage(chat.senderId, chat.content);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
}

function onLogout() {
    stompClient.send("/app/user.disconnectUser",
        {},
        JSON.stringify({nickName: nickname, fullName: fullname, status: 'OFFLINE'})
    );
    window.location.reload();
}

function onError() {
    console.log('fail')
}

//attaches event listener to usernameForm element. the enter chatroom button. when event happens, call connect method
usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
//adding event listener to logout element
logout.addEventListener('click', onLogout, true)
window.onbeforeunload = () => onLogout()

//STOMPJS LIBRARY 

//stompClient.subscribe(headers, cb, cb)
    //instance of stomp client created 

    //headers: optional headers object
    //cb: called once the connection is successfully established
    //cb: called if there is an error during the connection process
//stompClient.subscribe(destination, callback function)
    //client sends a subscription request to websocket server for the specified destination. server acknowledges subscription and starts sending messages to this client whenever a message is published to that destination

    //destination: topic/queue which the client is subcribing. destination = the path on the server where messages will be sent
    //function: gets called whenever a message is received on the subcribed destination

//stompClient.send(destination, headers, body)
    //whenever a message is sent to that destination by the server, cb function invoked with the message payload

    //destination: message will be sent to this endpoint. server will have a corresponding handler mapped to this endpoint to process the incoming message
    //headers: include any headers u want to send along with the message
    //body: the actual message payload being sent. if u are sending a json object, need to convert it to string using json.stringify

