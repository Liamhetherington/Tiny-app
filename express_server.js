var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())


function generateRandomString() {
  return crypto.randomBytes(6).toString("hex").substring(0, 6);
}

function addedtoDatabase (shortURL, longURL) {
  urlDatabase[shortURL] = longURL;
}

function existingEmail(email) {
  for (let userId in users) {
    let userEmail = users[userId].email;
    if (userEmail === email){
      return true;
    }
  }
  return false;
}

function getUser(email, password) {
  for (let user of Object.values(users)) {
    if(user.email === email && user.password === password) {
      return user
    }
  }
  return null;
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
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

app.get("/urls/register", (req, res) => {
  res.render("urls_register");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let currentUser = null;
  if (users[req.cookies.user_id]) {
    currentUser = users[req.cookies.user_id].email
  }
  let templateVars = { urls: urlDatabase,
                      user: currentUser,
                      };
        console.log(templateVars);
        console.log(req.cookies.user_id);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let currentUser = null;
  if (users[req.cookies.user_id]) {
    currentUser = users[req.cookies.user_id].email
  }
  let templateVars = {user: currentUser}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
    let currentUser = null;
  if (users[req.cookies.user_id]) {
    currentUser = users[req.cookies.user_id].email
  }
  let shortenedurl = req.params.shortURL;
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortenedurl],
                      user: currentUser};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortenedurl = req.params.shortURL;
  const longURL = urlDatabase[shortenedurl];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/login", (req, res) => {
  res.render("urls_loginpage");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = generateRandomString();
  if  (email === "" || password === ""){
    res.status(400).send("Please input Email and Password");
    return;
  } else if (existingEmail(email)) {
    res.status(400).send("Email already exists");
    return;
  } else {
      users[id] = {
      "id": id,
      "email": email,
      "password": password
    }
  }
  res.cookie("user_id", id)
  // console.log(users);
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.edit
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  let username = req.body.email;
  let password = req.body.password;
  let user = getUser(username, password)
  if(user) {
    res.cookie("user_id", user.id)
     res.redirect(`/urls`);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/login`);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  addedtoDatabase(shortURL, longURL);
  // console.log(urlDatabase);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});