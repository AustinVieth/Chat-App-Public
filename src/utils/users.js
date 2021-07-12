const users = [];

// For testing
class User {
  constructor(id, username, room) {
    this.id = id;
    this.username = username;
    this.room = room;
  }
}

const addUser = (user) => {
  //clean data
  user.username = user.username.trim().toLowerCase();
  user.room = user.room.trim().toLowerCase();

  //destructure out the important properties
  const { id, username, room } = user;

  if (!username || !room) {
    return {
      error: "Please provide a username and a room",
    };
  }

  const existingUser = users.find((user) => {
    return user.username === username && user.room === room;
  });

  if (existingUser) {
    return {
      error: "Username already in use!",
    };
  }

  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    const user = users.splice(index, 1)[0];

    return user;
  }

  return { error: "No User Found" };
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  if (!room) {
    return;
  }
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
