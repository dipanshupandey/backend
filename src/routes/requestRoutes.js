const express=require("express");
const requestRouter=express.Router();
const userAuth= require("../middlewares/auth");
requestRouter.post("/request/sendConnectionRequest", userAuth, async (req, res) => {

    res.send("Request sent by " + req.user.firstName);

});

module.exports=requestRouter;