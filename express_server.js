const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase};
    res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
    console.log(req.body);  // Log the POST request body to the console
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});
app.get("/urls/new", (req, res) => {
    
    res.render("urls_new");  
});
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});
app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL : req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
    res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);   
});
app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});
  
function generateRandomString() {
    const minVal = 35 ** 5;
    const randomVal = Math.floor(Math.random() * minVal) + minVal;
    return randomVal.toString(35);

}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});