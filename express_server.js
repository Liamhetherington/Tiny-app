var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const crypto = require("crypto");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');




app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession( {
  name: 'session',
  keys: ['keeererereregrewgwe']
}));

console.log();

function generateRandomString() {
  return crypto.randomBytes(6).toString("hex").substring(0, 6);
}

function addedtoDatabase (shortURL, longURL, userID) {
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID,
    shortURL: shortURL
  }
}

const urlsForUser = (id) => {
 let knownURLs = {};
 for (let key in urlDatabase) {
  if (urlDatabase[key].userID === id) {
    knownURLs[key] = urlDatabase[key];
  }
 }
 return knownURLs;
}

function existingEmail(email) {
  for (let userId in user) {
    let userEmail = user[userId].email;
    if (userEmail === email){
      return true;
    }
  }
  return false;
}

function getUser(email, password) {
  for (let key of Object.values(user)) {
    if(key.email === email && bcrypt.compare(password, [key].password)) {
      return key;
      console.log(key)
    }
  }
  return null;
}


const user = {
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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};




app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/register", (req, res) => {
  res.render("urls_register");
});


app.get("/urls", (req, res) => {
  let currentUser = null;
  if (user[req.session.user_id]) {
    currentUser = user[req.session.user_id].id;
  }
  let userURLs = urlsForUser(currentUser);
  let templateVars = { urls: userURLs,
                      user: user[req.session["user_id"]],

                      };
        // console.log(templateVars);
         // console.log(urlDatabase);
  if (!currentUser) {
    res.redirect(`/login`);
  } else {
  res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
    let currentUser = null;
  if (user[req.session.user_id]) {
    currentUser = user[req.session.user_id].id
  }
  let templateVars = {user: currentUser}
  if (currentUser) {
  res.render("urls_new", templateVars);
  } else {
    res.redirect("urls_loginpage");
  }
});

app.get("/urls/:shortURL", (req, res) => {
   let shortenedurl = req.params.shortURL;
   let templateVars = { shortURL: req.params.shortURL,
                      longURL: urlDatabase[shortenedurl].longURL,
                      user: user,
                      urls: urlDatabase,
                      url: req.params.shortURL}
    let currentUser = null;
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]){
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send("Not logged in");
  }
});

app.get("/u/:shortURL", (req, res) => {
  let shortenedurl = req.params.shortURL;
  const longURL = urlDatabase[shortenedurl].longURL;
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
      user[id] = {
      "id": id,
      "email": email,
      "password": bcrypt.hashSync(password, 10)
    }
    console.log(user);
  }
  req.session.user_id = "user_id";
  // console.log(users);
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
     delete urlDatabase[req.params.shortURL];
  }
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => { //BROKEN WILL FIX LATER
  console.log(urlDatabase);
  let newUrlDatabase = req.params.shortURL;

  let templateVars = {
                      [req.params.shortURL]: { longURL: req.body.edit,
                                        userID: generateRandomString()
                      }
                    };
  console.log(urlDatabase);

  res.redirect(`/urls`);
  // console.log(urlDatabase[req.params.shortURL]);
});

app.post("/login", (req, res) => {
  let username = req.body.email;
  let password = req.body.password;
  let loggedInUser = null;
  for (id in user) {
    const current = user[id]
    if (bcrypt.compareSync(password, current.password)) {
      loggedInUser = current
      break
      console.log("logged in user: ", loggedInUser)
    }
  }

  if (!loggedInUser) {
    res.send('Username or password incorrect. Please try again.')
    return
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  let userID = req.session.user_id;
  addedtoDatabase(shortURL, longURL, userID);

  // console.log(urlDatabase);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});