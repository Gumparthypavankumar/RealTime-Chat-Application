const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix : true
})

// Join chatRoom
socket.emit('joinRoom',{ username,room});

// Get Room and users
socket.on('roomUsers', ({ room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})
// Handling the message event
socket.on('message',(msg)=>{
    outputMessage(msg);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

chatForm.addEventListener('submit',(e) => {
    e.preventDefault();

    //Accessing the DOM element msg
    const msg = e.target.elements.msg.value;

    //Emitting message to the server
    socket.emit('chatMessage',msg);
    chatForm.reset();
    e.target.elements.msg.focus();
})

// Output message to DOM
function outputMessage(msg){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${ msg.username } <span>${ msg.time }</span></p>
    <p class="text">
        ${msg.text}
    </p>`;
    chatMessages.appendChild(div);
}

// Add Room Name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

// Add Users to DOM
function outputUsers(users){
    userList.innerHTML = `
    ${users.map((user) => `<li>${ user.username }</li>`).join('')}
    `;
}