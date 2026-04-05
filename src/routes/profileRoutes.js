const express=require("express");
const profileRouter=express.Router();
const userAuth=require("../middlewares/auth");
profileRouter.get("/profile", userAuth, async (req, res) => {
    console.log(req.cookies);
    res.send(req.user);
});

module.exports=profileRouter; 

