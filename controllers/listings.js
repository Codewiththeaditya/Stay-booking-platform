const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};


module.exports.renderNewForm = async(req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.createListing = async(req,res)=>{
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send()
        
    // console.log(response.body.features[0].geometry);
    // return res.send("done");

    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url,"..",filename);
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {filename, url};
    newListing.geometry = response.body.features[0].geometry;
    newListing.location = newListing.location.charAt(0).toUpperCase() + newListing.location.slice(1).toLowerCase();
    let location = newListing.location;
    newListing.locationSearch = location.toLowerCase().trim();
    await newListing.save();
    req.flash("success","Listing added successfully !")
    res.redirect("/listings");
}


module.exports.showListing = async(req,res)=>{
    let {id} = req.params;

    const listing = await Listing.findById(id).populate({path: "reviews", populate: "author"}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist !");
        res.redirect("/listings");
    }else{
        res.render("listings/show.ejs",{listing});
    }
    // 
}

module.exports.renderEditForm = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist !");
        res.redirect("/listings");
    }else{
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
        res.render("listings/edit.ejs",{listing , originalImageUrl});
    }
    
    
};

module.exports.updateListing = async (req,res)=>{
    const {id} = req.params;
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send()

    
    let updatedListing = await Listing.findByIdAndUpdate(id, {...req.body.listing}, {new: true});
    updatedListing.locationSearch = updatedListing.location.trim().toLowerCase();
    console.log(updatedListing.locationSearch);

    if(req.file){
        let filename = req.file.filename;
        let url = req.file.path;
        updatedListing.image = {filename, url};
        await updatedListing.save();
    }
    updatedListing.geometry = response.body.features[0].geometry;
    await updatedListing.save();
    
    req.flash("success","Listing updated successfully !")

    res.redirect(`/listings/${id}`);
};

module.exports.filterListing = async(req,res)=>{
    
    let {searchInp} = req.body;
    searchInp = searchInp.trim().toLowerCase();
    // searchInp = searchInp.toLowerCase()

    let filteredListing = await Listing.find({locationSearch: searchInp});

    if(filteredListing){
        return res.render('listings/filteredListing.ejs',{filteredListing});
    }

    res.send(req.body,searchInp);
}

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted successfully !")

    res.redirect('/listings');
}