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
        const user=req.user;
        let hiddenUsers = [];
        const connections = await connectionRequestModel.find(
            {
                $or: [
                    { fromId: user._id },
                    { toId: user._id }
                ]
            }).select(["fromId","toId"]);

        const connectionsIds=connections.map((item)=>item.fromId.equals(user._id)?item.toId:item.fromId);
        hiddenUsers=[...connectionsIds,user._id];
        const feed=await userModel.find({_id:{$nin:hiddenUsers}}).select(["firstName","lastName","age","about","gender","skills"]);
        
        return res.send(feed);
    } catch (error) {
        return res.status(400).json({ message: "something went wrong!" ,  error: error });
    }
});

module.exports = userRouter

