const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);

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

app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email) {
    return res.send("404");
  }
  const user = findUserByEmail(email, users);
  if (!user) {
    return res.send("404 email not found!");
  }
  if (!bcrypt.compareSync(password, findUserByEmail(email, users).password)) {
    res.send("passwords dont match 403");
  }
  res.cookie("user_id", user.id);
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
app.get("/register", (req, res) => {
  const templateVars = {
    user: null,
  };
  return res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = generateRandomString();
  if (!password || !email) {
    res.send("404");
  } else if (findUserByEmail(email, users)) {
    res.send("404 email already exists!");
  } else {
    const user_id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = {
      email: email,
      id: user_id,
      password: hashedPassword,
    };
    users[user_id] = user;
    res.cookie("user_id", user_id);
    return res.redirect("/urls");
  }
});
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (!user_id) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[user_id], urls: urlDatabase };
  return res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  return res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (!user_id) {
    return res.send("404 cant access this feature without being logged in!");
  }
  const templateVars = { user: users[user_id], urls: urlDatabase };
  return res.render("urls_new", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies["user_id"];
  for (let id in users) {
    console.log(id);
    if (id === user_id) {
      const templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user: users[id],
        urls: urlDatabase,
      };
      return res.render("urls_show", templateVars);
    }
  }
});
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  return res.redirect(longURL);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  return res.redirect("/urls");
});
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  return res.redirect("/urls");
});

function generateRandomString() {
  const minVal = 35 ** 5;
  const randomVal = Math.floor(Math.random() * minVal) + minVal;
  return randomVal.toString(35);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
