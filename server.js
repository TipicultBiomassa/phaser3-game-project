if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

//vonage
const opentok = require("opentok");
const OT = new opentok(API_KEY, API_SECRET);
//////


var express = require('express');
var app = express();
var server = require('http').Server(app);
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require('express-flash')
const session = require("express-session");
const methodOveride = require("method-override");



const initializePassport = require("./passport-config");
const { Session } = require("inspector");
initializePassport(
    passport,
    email => Users.find(user => user.email === email),
    id => Users.find(user => user.id === id)
);

var io = require('socket.io')(server);

const Users = [];
let userEmail = [];

var players = {};
let sessions = {};


app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOveride("_method"));
app.use(express.static('views'));


app.get('/', checkNotAuthenticated, (req, res) => {
    res.render("index.ejs");
});

app.get("/town", checkAuthenticated, (req, res) => {
    if (!req.user.status) {
        res.render('town.ejs', { email: req.user.email, status: req.user.status, name: req.user.name });
    }
    else {
        res.redirect("/error05");
    }
    req.user.status = true;
});

//////////////vonage
app.post("/town", checkAuthenticated, (req, res) => {

    const sessionName = req.params.name;

    if (sessions[sessionName]) {
        const token = OT.generateToken(sessions[sessionName], {
            role: "publisher",
            data: "roomname=" + sessionName
        });

        res.send({
            sessionId: sessions[sessionName],
            apiKey: API_KEY,
            token: token
        })
    }
    else {
        OT.createSession(function (err, session) {
            sessions[sessionName] = session.sessionId;

            const token = OT.generateToken(sessions[sessionName], {
                role: "publisher",
                data: "roomname=" + sessionName
            });

            res.send({
                sessionId: sessions[sessionName],
                apiKey: API_KEY,
                token: token
            })
        });
    }
});
////////

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
});

app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
});

app.get("/profile", checkAuthenticated, (req, res) => {
    res.render("profile.ejs", { name: req.user.name });
});

app.get("/error05", checkAuthenticated, (req, res) => {
    res.render("error05.ejs", { name: req.user.name });
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        if (userEmail.indexOf(req.body.email) == -1) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            Users.push({
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                status: false
            })
            userEmail.push(req.body.email);
            res.redirect("/login");
        }
        else res.redirect("/register");

    }
    catch {
        res.redirect("/register");
    }
});

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true
}));

app.delete("/logout", (req, res) => {
    req.logOut();
    res.redirect("/login");
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/profile");;
    }
    next();
}


function findEmailInUsers(users, email) {
    for (let i in users) {
        if (users[i].email == email) return i;
    }
}
//////////////////////

players.onConnect = function (socket, name) {

    players[socket.id].x = 650;
    players[socket.id].y = 600;
    players[socket.id].playerId = socket.id;
    players[socket.id].username = name;
    players[socket.id].fram = 0;
    players[socket.id].streamId;

    // когда игроки движутся, то обновляем данные по ним
    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].fram = movementData.fram;
        // отправляем общее сообщение всем игрокам о перемещении игрока
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on("sendMsgToServer", function (data) {
        socket.broadcast.emit("addToChat", players[socket.id].username + ": " + data);
    });

    socket.on("addStreamId", function (streamId) {
        if (players[socket.id].streamId != streamId) {
            players[socket.id].streamId = streamId;
            socket.broadcast.emit("updateStreamId", players[socket.id]);
        }
    })

    // отправляем объект players новому игроку
    socket.emit('currentPlayers', players);

    // обновляем всем другим игрокам информацию о новом игроке
    socket.broadcast.emit('newPlayer', players[socket.id]);
}
/////////////////////////


io.on('connection', function (socket) {

    //подключение к сцене Menu
    socket.on("playerInMenu", function (data) {
        players[socket.id] = { email: data };

        //подключение к сцене Play
        socket.on("play", function (name) {
            players.onConnect(socket, name);
        });
    });


    socket.on('disconnect', function () {
        //меняем стутус пользователя на ofline
        try {
            let userNameIndex = findEmailInUsers(Users, players[socket.id].email);
            Users[userNameIndex].status = false;
        }
        catch { ; }
        // удаляем игрока из нашего объекта players 
        delete players[socket.id];
        // отправляем сообщение всем игрокам, чтобы удалить этого игрока
        io.emit('exit', socket.id);
    });
});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 2000;
}
server.listen(port, function () {
    console.log(`Listening on ${server.address().port}`);
});
