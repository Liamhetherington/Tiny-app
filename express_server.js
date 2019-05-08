var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const crypto = require("crypto");


app.set("view engine", "ejs");

function generateRandomString() {
  return crypto.randomBytes(6).toString("hex").substring(0, 6);
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function addedtoDatabase (shortURL, longURL) {
  urlDatabase[shortURL] = longURL;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let shortenedurl = req.params.shortURL;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortenedurl] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
    let shortenedurl = req.params.shortURL;
    const longURL = urlDatabase[shortenedurl];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase);
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  addedtoDatabase(shortURL, longURL);
  console.log(urlDatabase);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});