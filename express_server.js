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
    console.log("url data base id: ", urlDatabase[key].userID)
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

function getUser(email) {
  for (let key of Object.values(user)) {
    if(key.email === email) {
      return key;
    }
  }
  return null;
}

function validUser(userCurrent) {
  for (let current in user) {
    if(current === userCurrent) {
      return true;
    }
    return null;
  }
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
    password: "1"
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

app.get(`/`, (req, res) => {
  res.redirect(`/urls`);
});

app.get("/urls", (req, res) => {
  const currentUser = user[req.session.user_id];
  if(currentUser) {
    let userURLs = {};
    for (let URL in urlDatabase) {
      console.log("newURL ", URL)
      console.log('urlDatabase ', urlDatabase)
      if (urlDatabase[URL].userID === req.session.user_id) {
        userURLs[URL] = urlDatabase[URL];
      }
    }
    let templateVars = { urls: userURLs,
                       user: currentUser.email
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(401).send('Error 401: Please <a href="/login"> Login. </a>');
  }
});

app.get("/urls/new", (req, res) => {
  const currentUser = user[req.session.user_id];
  let templateVars = {user: currentUser}
  if (currentUser) {
  res.render("urls_new", templateVars);
  } else {
    res.redirect("urls_loginpage");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!(urlDatabase[req.params.shortURL])) {
    res.status(404).send('Error 404: Page not found. <a href="/"> Return to home page.</a>');
  } else if (!req.session.user_id) {
    res.status(401).send('Error 401: Please <a href="/login"> Login. </a>');
  } else if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.status(403).send('Error 403: This link belongs to another user. <a href="/" Return to home page.</a>');
  } else {

    let templateVars = {
      url: req.params.shortURL,
      long: urlDatabase[req.params.shortURL].longURL
    }
    res.render('urls_show', templateVars);
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

  }
  req.session.user_id = id;
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session["user_id"]) {
     delete urlDatabase[req.params.shortURL];
  }
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  let newUrlDatabase = req.params.shortURL;

  let templateVars = {
                      [req.params.shortURL]: { longURL: req.body.edit,
                                                userID: generateRandomString()
                      }
                    };

  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let loggedInUser = null;
  const current = getUser(email)

    if (current && bcrypt.compareSync(password, current.password)) {
      loggedInUser = current
  }
  if (!loggedInUser) {
    res.send('Username or password incorrect. Please try again.')
    return
  }

  req.session.user_id = loggedInUser.id

  res.redirect('/urls')

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  console.log("Random strong ", shortURL)
  let userID = req.session.user_id;
  addedtoDatabase(shortURL, longURL, userID);
  console.log("Hyello")

  // console.log(urlDatabase);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});