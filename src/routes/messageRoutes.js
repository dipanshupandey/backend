const express=require('express');
const userAuth = require('../middlewares/auth');
const messageRoutes=express.Router();

messageRoutes.post('api/messages/send',userAuth,async (req,res)=>{
    try {
        const {text,senderId,conversationId}=req.body||{};
        if(!text||!senderId||!conversationId)
        {
            
        }
    } catch (error) {
        
    }
});