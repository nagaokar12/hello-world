var fs = require('fs');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());

/* For Assignment 3 */
var session = require('express-session');
app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));

var filename = './user_data.json';

app.get('/set_cookie', function(request, response) {
    /* Sends a cookie to the requester */
    response.cookie('name','Reece');
    response.send('The name cookie has been sent!');
});

app.get('/use_cookie', function(request, response) {
    /* Gets name cookie from requester respond with a message */
    console.log(request.cookie());
    response.send(`Welcome to the Use Cookie page Reece`);
});

if (fs.existsSync(filename)) {
    /* Have regular data file, so read data and parse into user_registration_info object */
    let data_str = fs.readFileSync(filename, 'utf-8');
    var user_registration_info = JSON.parse(data_str);
    var stats = fs.statSync(filename);
    console.log(user_registration_info);
    console.log(filename + ' has ' + stats["size"] + ' characters');
} else {
    console.log(filename + 'does not exist!');
}

app.get("/", function (request, response) {
    response.send('Nothing here');
});

app.use(express.urlencoded({ extended: true }));

app.get("/login", function (request, response) {
     /* Check if already logged in by seeing if the username cookie exists */
     var welcome_str = 'Welcome! You need to login.';
     if(typeof request.cookies.username != 'undefined') {
      welcome_str = `Welcome ${request.cookies.username}! You logged in last on ${request.session.lastLogin}`;
     }
    /* Give a simple login form */
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
});

app.get("/register", function (request, response) {
    /* Give a simple register form */
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
});

app.post("/register", function (request, response) {
    // process a simple register form
    username = request.body.username;
    if (typeof user_registration_info[username] == 'undefined' && (request.body['password'] == request.body['repeat_password'])) {
        user_registration_info[username] = {};
        user_registration_info[username].password = request.body.password;
        user_registration_info[username].email = request.body.email;


        fs.writeFileSync(filename, JSON.stringify(user_registration_info));
        response.redirect('./login');
        console.log("Registered!");
    }
    else {
        response.redirect('./register');
        console.log("Not registered.");
    }
});

app.post("/login", function (request, response) {
    /* Get last login time from session if it exists. If none, create first login */
    /* Assume it's the first time logging in */
    var lastLoginTime = 'first login!';
    /* If there is something from the last login */
    if(typeof request.session.lastLogin != 'undefined') {
        /* Set login to what was put in last */
        lastLoginTime = request.session.lastLogin;
    }
    /* Process login form POST and redirect to logged in page if ok, back to login page if not */
    let login_username = request.body['username'];
    let login_password = request.body['password'];

    console.log(lastLoginTime);

    /* Check if username exists, then check password entered matches stored password */
    if (typeof user_registration_info[login_username] != 'undefined') {
        if (typeof user_registration_info[login_username]["password"] == login_password) {
            request.session.lastLogin = new Date();
            response.cookie('username,', login_username);
            response.send(`${login_username} is logged in/ You last logged in on ${lastLoginTime}`);
            return;
        }
        else {
            response.redirect('/login');
        }
    }
    else {
        response.send(`${login_username} does not exist`);
    }
    response.send('processing login', JSON.stringify(request.body));
});

app.listen(8080, () => console.log(`Listening on port 8080`));