const express=require('express');
const conversationRouter=express.Router();
const Conversation = require('../models/conversation');
const userAuth =require("../middlewares/auth");
const mongoose = require("mongoose");
const ObjectId=mongoose.Types.ObjectId;
const userModel=require("../models/user");
const connectionRequestModel = require('../models/connectionRequest');

async function validateConversation(participant1,participant2)
{
        if(!participant1||!participant2)
        {
            throw new Error("Invalid Request");
        }
        if(!ObjectId.isValid(participant1)||!ObjectId.isValid(participant2))
        {
            throw new Error('Invalid ID');
        }

        if(participant1.toString()===participant2)
        {
            throw new Error("Can't create conversation with self");
        }
        const userExist=await userModel.findById(participant2);
       
        if(!userExist)
        {
            throw new Error("User not exist!");
        }

        const participant2Id=new ObjectId(participant2);
       
        const areMatched=await connectionRequestModel.exists({
            $or:[
                {
                    fromId:participant1,
                    toId:participant2Id
                },
                {
                    fromId:participant2Id,
                    toId:participant1
                }
            ],
            status:"matched"
        });
        if(!areMatched)
        {
            throw new Error("Participants not connected!");
        }
        const existingConversation=await Conversation.findOne({
            participants:
            {
            $all:[participant1,participant2]
            }
        });
      
        if(existingConversation)
        {
            throw new Error("Duplicate conversation not allowed");
        }

}
conversationRouter.post('/conversation/create',userAuth,async (req,res)=>{
    try {
        
        const participant1=req.user._id;
        const {participant2}=req.body||{};
        console.log(participant1,participant2);
        await validateConversation(participant1,participant2);
        
        const ress=await Conversation.create({
            participants:[participant1,participant2]
        });
        res.status(200).json({
            message:"Conversation created successfully",
            data:ress
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message:"Conversation creation failed!",
            error:error.message
        });
    }
})

conversationRouter.get('/conversation',userAuth,async(req,res)=>{
    try {
        const conversations=await Conversation.find({
            participants:req.user._id,
        }).populate("participants","firstName lastName photoURL").sort({lastMessageAt:-1});
        res.status(200).json({
            message:"Conversations fetched successfully",
            data:conversations
        });
    } catch (error) {
        return res.status(400).json({
            message:"Conversations fetch failed!",
            error:error.message
        });
    }
})
module.exports=conversationRouter;