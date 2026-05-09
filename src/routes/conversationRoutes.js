const express=require('express');
const conversationRouter=express.Router();
const Conversation = require('../models/conversation');
const userAuth =require("../middlewares/auth");
const { mongoose } = require('mongoose');
const ObjectId=mongoose.Types.ObjectId;

async function validateConversation(participant1,participant2)
{
        if(!participant1||!participant2)
        {
            throw new Error("Invalid Request");
        }
        if(!ObjectId.isValid(participant2))
        {
            throw new Error('Invalid ID');
        }

        if(participant1.toString()===participant2)
        {
            throw new Error("Can't create conversation with self");
        }
        const existingConversation=await Conversation.findOne({
            participants:
            {
            $all:[participant1,participant2]
            }
        });
      
        if(existingConversation)
        {
            throw new Error("Duplicate coversation not allowed");
        }

}
conversationRouter.post('/conversation/create',userAuth,async (req,res)=>{
    try {
        console.log(req.body);
        console.log(req.user._id);
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
        return res.status(400).json({
            message:"Conversation creation failed!",
            error:error.message
        });
    }
})
module.exports=conversationRouter;