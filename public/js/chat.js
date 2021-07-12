const socket = io();

const form = document.querySelector("#message-form");
const messageBtn = form.querySelector("button[type=submit]");
const locationBtn = document.querySelector("#send-location");
const messageInput = form.querySelector("input");
const messages = document.querySelector("#messages");
const sidebar = document.querySelector(".chat__sidebar");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  //get the new message element
  const newMessage = messages.lastElementChild;

  //height of new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = messages.offsetHeight;

  //container height
  const containerHeight = messages.scrollHeight;

  //how far have I scrolled
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("updateMessage", ({ value: message, createdAt, username }) => {
  const html = Mustache.render(messageTemplate, {
    message,
    createdAt: moment(createdAt).format("h:mm:ss A"),
    username,
  });

  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("updateLocation", ({ value: url, createdAt, username }) => {
  const html = Mustache.render(locationTemplate, {
    url,
    createdAt: moment(createdAt).format("h:mm:ss A"),
    username,
  });

  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  console.log(room);
  console.log(users);

  sidebar.innerHTML = html;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.currentTarget.message.value;
  e.currentTarget.reset();
  messageBtn.setAttribute("disabled", "disabled");
  messageInput.focus();

  socket.emit("sendMessage", message, (err) => {
    messageBtn.removeAttribute("disabled");
    if (err) {
      return console.log(err);
    }

    console.log("Message Succesfully Delivered!");
  });
});

locationBtn.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browsers");
  }

  locationBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    let lat = position.coords.latitude;
    let long = position.coords.longitude;

    socket.emit("sendPosition", { lat, long }, (err) => {
      locationBtn.removeAttribute("disabled");
      if (err) {
        return console.log(err);
      }
      console.log("Location Shared!");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    location.href = "/";
    alert(error);
  }
});
