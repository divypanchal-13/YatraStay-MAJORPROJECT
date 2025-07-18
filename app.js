const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const warpAsync = require("./utils/warpAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
    .then(() => {
        console.log(" 😀 connected to DB🫡 ");
    }).catch((err) => {
        console.error("ERROR in Connection with DB😓 : ", err);
    });

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/YatraStay');
}

app.get("/", (req, res) => {
    res.render("home.ejs");
});

// listing velidation
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


//Index Route
app.get("/listings", warpAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", warpAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings",
     validateListing,
     warpAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

}));

//Edit Route
app.get("/listings/:id/edit", warpAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id",validateListing, warpAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", warpAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("⛔❌ Deleted Listing: ", deletedListing);
    res.redirect("/listings");
}));

app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Middleware 
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong! " } = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.status(statusCode).send(message); 
});

//Server listenIng
app.listen(8080, () => {
    console.log(" ✅ server is listening.... ");
});
