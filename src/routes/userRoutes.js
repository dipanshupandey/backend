const express = require("express");
const userRouter = express.Router();
const userAuth = require("../middlewares/auth");
const connectionRequestModel = require("../models/connectionRequest");
const userModel=require("../models/user");

userRouter.get("/user/requests/interested", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const requests = await connectionRequestModel.find({
            toId: user._id,
            status: "interested"
        }).populate("fromId", ["firstName", "lastName", "age", "gender", "about", "skills", "photoURL"]);
        if (!requests)
            return res.status(400).json({ message: "Request not found!" });
        res.send(requests);
    } catch (error) {
        res.status(400).json({ message: "something went wrong", error: error.message });
    }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const connections = await connectionRequestModel.find({
            $or: [
                { fromId: user._id },
                { toId: user._id }
            ],
            status: "matched"
        }).populate("fromId", ["firstName", "lastName", "age", "gender", "about", "skills", "photoURL"]).populate("toId", ["firstName", "lastName", "age", "gender", "about", "skills", "photoURL"]);
        const data = connections.map(connection => connection.fromId._id.equals(user._id) ? connection.toId : connection.fromId);
        // res.send(data);
        return res.json({ data: data });
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong!",
            error: error.message
        });
    }
});

userRouter.get("/user/feed", userAuth,async (req, res) => {
    try {
        let page=parseInt(req.query.page)||1;
        let limitProfile=parseInt(req.query.limit)||10;
        if(page<0)
        {
            return res.status(401).json({
                message:"Page should be a positive number!",
            });
        }
        if(limitProfile>10||limitProfile<=0)
        {
            limitProfile=10;
        }
        if(page===0)
        {
            page=1;
        }
        if(page>100)
        {
            return res.status(400).json({message:"Page limit exceeded!"});
        }
        const profileSkip=(page-1)*limitProfile;
        const user=req.user;
        const hiddenUsers = new Set();
        const connections = await connectionRequestModel.find(
            {
                $or: [
                    { fromId: user._id },
                    { toId: user._id }
                ]
            }).select(["fromId","toId"]);

        connections.forEach((item)=>{
            hiddenUsers.add(item.fromId.toString());
            hiddenUsers.add(item.toId.toString());
        });

        const feed=await userModel.find({
            $and:[
                {_id:{$nin:Array.from(hiddenUsers)}},
                {_id:{$ne:user._id}}
            ]
        }).select(["firstName","lastName","age","about","gender","skills"]).skip(profileSkip).limit(limitProfile);
        
        return res.send(feed);
    } catch (error) {
        return res.status(400).json({ message: "something went wrong!" ,  error: error.message });
    }
});

module.exports = userRouter

