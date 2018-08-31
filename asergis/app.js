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
    
    
 mongoose.connect("mongodb://localhost/asergis");
    
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





//============
// ROUTES
//============
app.get("/", function(req, res){
    res.sendfile("home");
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
           res.redirect("home.");
        });
    });
});


// show login form
app.get("/login", function(req, res){
   res.render("login."); 
});
// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "home",
        failureRedirect: "/login"
    }), function(req, res){
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



var server = app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server is running");
});


