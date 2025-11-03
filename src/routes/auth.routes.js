const express = require("express")
const {register, login, logout, getAdminData, verify} = require("../controllers/auth.controller")
const {isAuthenticated, isAdmin} = require("../middlewares/auth.middleware")
const router = express.Router();


router.post("/signup",register);
router.post("/verify", verify); 
router.post("/login", login);
router.post("/logout",logout);



// Protected route - only admin
router.get("/getdata", isAuthenticated, isAdmin, getAdminData);

module.exports = router;