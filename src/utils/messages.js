function createTimeStampedMessage(username, value) {
  return {
    value,
    createdAt: new Date().getTime(),
    username,
  };
}

module.exports = {
  createTimeStampedMessage,
};
