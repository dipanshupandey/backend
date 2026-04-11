const express=require("express");
const userRouter=express.Router();
const userAuth=require("../middlewares/auth");
const connectionRequestModel=require("../models/connectionRequest");

userRouter.get("/user/requests/interested",userAuth,async (req,res)=>{
    try {
        const user=req.user;
        const requests=await connectionRequestModel.find({
            toId:user._id,
            status:"interested"
        }).populate("fromId",["firstName","lastName","age","gender","about","skills","photoURL"]);
        if(!requests)
            return res.status(400).json({message:"Request not found!"});
        res.send(requests);
    } catch (error) {
        res.status(400).json({message:"something went wrong",error:error.message});
    }
})

module.exports= userRouter

