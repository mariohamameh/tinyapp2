const express = require("express");
const {urlDatabase, users, findUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
//const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["user_id", "abc"],

    maxAge: 24 * 60 * 60 * 1000,
  })
);
//app.use(cookieParser());
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);

app.get("/", (req, res) => {
    if (req.session.user_id) {
        res.redirect("/urls")
    } else {
        res.redirect("/login");
    }
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
  req.session.user_id = user.id;
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
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
    req.session.user_id = user_id;
    return res.redirect("/urls");
  }
});
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.redirect("/login");
  }
  const userURLs = urlsForUser(user_id, urlDatabase);
  const templateVars = { user: users[user_id], urls: userURLs };
  return res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  return res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
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
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID, urlDatabase);
  const shortURL = req.params.shortURL;
  let templateVars = {};
  if (userURLs[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    templateVars.user = users[userID];
    templateVars.longURL = longURL;
    templateVars.shortURL = shortURL;
  } else {
    templateVars.user = users[userID];
    templateVars.shortURL = null;
  }
  return res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.send("404 invalid url");
  }
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  return res.redirect("/urls");
});
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.send("400 not authorized to view urls");
  } else {
    const userURLs = urlsForUser(userID, urlDatabase);
    if (userURLs[req.params.shortURL]) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      return res.redirect("/urls");
    } else {
      res.send("400 not authorized to view urls");
    }
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
