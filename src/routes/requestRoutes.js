const express=require("express");
const requestRouter=express.Router();
const userAuth= require("../middlewares/auth");
const connectionRequestModel=require("../models/connectionRequest");
requestRouter.post("/request/:status/:toUserId", userAuth, async (req, res) => {

    try {
        const fromId=req.user._id;
        const toId=req.params.toUserId;
        const status=req.params.status;
        const connectionRequest=new connectionRequestModel({
            fromId,
            toId,
            status
        })
        console.log(connectionRequest);
        const data=await connectionRequest.save();
        res.json({
            message:"Success",
            data:data
        });
    } catch (error) {
        res.send("Error "+error.message);
    }



});

module.exports=requestRouter;