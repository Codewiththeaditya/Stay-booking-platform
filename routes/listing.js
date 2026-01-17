let express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings");
const multer = require('multer');
const {storage} = require("../cloudConfig.js" )
const upload = multer({ storage });



router
    .route("/")
    .get(wrapAsync(listingController.index)) //Index Route :
    .post(isLoggedIn,  validateListing, upload.single('listing[image]'), wrapAsync(listingController.createListing))


//New Route :
router.get("/new", isLoggedIn,wrapAsync(listingController.renderNewForm));

//Edit Route :
router.get("/:id/edit", isLoggedIn, isOwner,  wrapAsync(listingController.renderEditForm));

router.post("/search",wrapAsync(listingController.filterListing));

router
    .route("/:id")
    .put( isLoggedIn, isOwner, validateListing, upload.single('listing[image]'), wrapAsync(listingController.updateListing)) //Update:
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)) //Delete Route :
    .get(wrapAsync(listingController.showListing)) //show Route :

module.exports = router;