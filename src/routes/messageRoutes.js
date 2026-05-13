const express = require('express');
const userAuth = require('../middlewares/auth');
const messageRoutes = express.Router();
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Conversation = require("../models/conversation");
const Message = require("../models/message");


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

        const conversation=await validateMessageRequest(conversationId, senderId, text);
        const data = await Message.create({
            text,
            senderId,
            conversationId
        });

      
        conversation.lastMessage=text;
        conversation.lastMessageAt=Date.now();
        await conversation.save();
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

module.exports = messageRoutes;