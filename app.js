var express =           require("express"),
    app =               express(),
    bodyParser =        require("body-parser"),
    expressSanitizer =  require("express-sanitizer"),
     passport         = require("passport"),
   methodOverride =    require("method-override"),
    mongoose =          require("mongoose"),
    socket =            require("socket.io"),
    User              = require("./models/user"),
    LocalStrategy     = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");
    
    
 mongoose.connect("mongodb://localhost/new123");
    
 app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

app.use(require("express-session")({
    secret: "You'll never walk alone",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());  
passport.deserializeUser(User.deserializeUser());



var server = app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running");
});


//============
// ROUTES
//============
app.get("/", function(req, res){
    res.render("home");
});

app.get("/chat", isLoggedIn , function(req, res){
    res.sendfile("index.html",{"root":'views'});
});
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    // Handle chat event
    socket.on('chat', function(data){
        // console.log(data);
        io.sockets.emit('chat', data);
    });

    // Handle typing event
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });

});
//show sign up form
app.get("/register", function(req, res){
   res.render("register"); 
});

// handle register

app.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username,
        fullname: req.body.fullname,
        email: req.body.email
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register.');
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("home");
        });
    });
});


// login

//render login form
app.get("/login", function(req, res){
   res.render("login"); 
});
//login logic
//middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/chat",
    failureRedirect: "/login"
}) ,function(req, res){
});

// logout route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("home");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}







