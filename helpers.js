const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
const findUserByEmail = function (email, database) {
  for (let id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
  return undefined;
};
const urlsForUser = function (userID) {
  const output = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      output[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return output;
};
function generateRandomString() {
  const minVal = 35 ** 5;
  const randomVal = Math.floor(Math.random() * minVal) + minVal;
  return randomVal.toString(35);
}
module.exports = {urlDatabase, users, findUserByEmail, generateRandomString, urlsForUser };
