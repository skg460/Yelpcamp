var express    = require("express"),
	app        = express(),
	bodyParser = require("body-parser"),
	mongoose   = require("mongoose");
	Campground = require("./models/campground"),
	seedDB 	   = require("./seeds"),
	Comment    = require("./models/comment");

seedDB();

mongoose.connect("mongodb://localhost/yelp_camp");

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));





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
			res.render("index",{campgrounds:allcampgrounds});
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
	res.render("new.ejs");
});


app.get("/campgrounds/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err)
			console.log(err);
		else
			res.render("show",{campground: foundCampground});

	});	
	
});

app.listen(3000,function(){
	console.log('YelpCamp server has started');
});