var express       = require("express"),
	app           = express(),
	bodyParser    = require("body-parser"),
	mongoose      = require("mongoose"),
	passport      = require("passport"),
	LocalStrategy = require("passport-local"),
	Campground    = require("./models/campground"),
	seedDB 	      = require("./seeds"),
	User 	      = require("./models/user"),
	Comment       = require("./models/comment");



mongoose.connect("mongodb://localhost/yelp_camp");

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));

seedDB();

//Passport configuration

app.use(require("express-session")({
	secret: "i am the one who knocks",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});

// Campground.create(
// 	{
// 		name: "Chandrashila",
// 		image:"https://i2.wp.com/ultimateaim.in/wp-content/uploads/2015/02/Deoriatal-Campsite.jpg?fit=590%2C431",
// 		description: "Very high above the ground, Amazing views and experience."
// 	}, function(err,campground){
// 	if(err)
// 		console.log('Error');
// 	else{
// 		console.log('Newly created campground');
// 		console.log(campground);
// 	}
// });




app.get("/",function(req,res){
	res.render("landing");
});

// var campgrounds = [
// 		{name: "Chopta", image:"https://www.whitemagicadventure.com/sites/default/files/trip_images/_MG_2066_filtered%20%28Copy%29.jpg"},
// 		{name: "Chandrashila", image:"https://i2.wp.com/ultimateaim.in/wp-content/uploads/2015/02/Deoriatal-Campsite.jpg?fit=590%2C431"},
// 	];

app.get("/campgrounds",function(req,res){
	
	Campground.find({}, function(err,allcampgrounds){
		if(err)
			console.log(err);
		else
			res.render("campgrounds/index",{campgrounds:allcampgrounds});
	});

});

app.post("/campgrounds",function(req,res){
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var newCampground = {name: name, image: image, description: description};

	Campground.create(newCampground, function(err,campground){
		if(err)
			console.log(err);
		else
			res.redirect("/campgrounds");
	});
	
});


app.get("/campgrounds/new",function(req,res){
	res.render("campgrounds/new");
});


app.get("/campgrounds/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err)
			console.log(err);
		else
			res.render("campgrounds/show",{campground: foundCampground});

	});	
	
});


//<================>
//Comment Routes
//<================>

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		if(err)
			console.log(err);
		else
			res.render("comments/new",{campground:foundCampground});
	});
	
});

app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
	//lookup campground using id
	Campground.findById(req.params.id, function(err,campground){
		if(err)
			res.redirect("/campgrounds");
		else{
			Comment.create(req.body.comment,function(err,comment){
				if(err)
					console.log(err);
				else{
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/"+campground._id);
				}
			});
		}
	});
});

//Auth Routes

app.get("/register", function(req,res){
	res.render("register");
});

app.post("/register", function(req,res){
	var newUser = new User({
		username: req.body.username
	});
	User.register(newUser, req.body.password, function(err,user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req,res, function(){
			res.redirect("/campgrounds");
		});
	});
});

app.get("/login", function(req,res){
	res.render("login");
});

app.post("/login", passport.authenticate("local",{
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
}), function(req,res){
	console.log("login successful");
});

app.get("/logout", function(req,res){
	req.logout();
	res.redirect("/campgrounds");
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

app.listen(3000,function(){
	console.log('YelpCamp server has started');
});