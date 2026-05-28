const express = require('express');
const userAuth = require('../middlewares/auth');
const messageRoutes = express.Router();
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const message = require('../models/message');
const { getIO } = require('../socket/socket');
const activeConversations = require('../utils/activeConversations');

async function validateMessageRequest(conversationId, senderId, text) {
    if (!text?.trim() || !conversationId) {
        throw new Error("Message not valid!");
    }

    if (!ObjectId.isValid(conversationId)) {
        throw new Error("Invalid conversation!");
    }
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new Error("No conversation!");
    }
    const isParticipant = conversation.participants.some((participant) => participant.equals(senderId));
    if (!isParticipant) {
        throw new Error("Not part of the conversation!");
    }
    return conversation;

}
messageRoutes.post('/api/conversations/:conversationId/messages', userAuth, async (req, res) => {
    try {
        const { text } = req.body || {};
        const { conversationId } = req.params;
        const senderId = req.user._id;

        const conversation = await validateMessageRequest(conversationId, senderId, text);
        const data = await Message.create({
            text,
            senderId,
            conversationId
        });


        conversation.lastMessage = text;
        conversation.lastMessageAt = Date.now();
        const receiverId=conversation.participants[0].equals(senderId)?conversation.participants[1]:conversation.participants[0];
        if(activeConversations.get(receiverId.toString())!==conversationId){
            const currentUnreadCount=conversation.unreadCount.get(receiverId.toString())||0;
            conversation.unreadCount.set(receiverId.toString(),currentUnreadCount+1);
        }
        console.log("conversation after update",conversation);
        await conversation.save();
        const io = getIO();
        io.to(conversationId).emit("message:new", data);
        return res.status(201).json({
            message: "Message sent",
            data
        });

    } catch (error) {
        res.status(400).json({
            message: "Something went wrong!",
            error: error.message
        });
    }
});

messageRoutes.get('/api/conversations/:conversationId/messages', userAuth, async (req, res) => {
    try {
        
        const {conversationId} = req.params;
        const userId=req.user._id;
        if (!conversationId || !ObjectId.isValid(conversationId)) {
            throw new Error("Conversation not valid!");
        }
        
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new Error("No conversation!");
        }
        
        const isParticipant=conversation.participants.some((participant)=>participant.equals(userId));
        if(!isParticipant)
        {
            throw new Error("Unauthorized!");
        }
        const messages=await Message.find({
            conversationId:conversationId,
        }).sort({createdAt:1});
        
        return res.status(200).json({
            message: "Messages fetched successfully",
            data:messages
        });
    } catch (error) {
        return res.status(400).json({
            message:"Something went wrong",
            error:error.message
        })
    }
});
module.exports = messageRoutes;