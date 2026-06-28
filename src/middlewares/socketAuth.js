const jwt=require('jsonwebtoken');
const User=require("../models/user");
const cookie=require("cookie");
const Conversation=require("../models/conversation");
const mongoose=require("mongoose");

const socketAuth=async(socket,next)=>{
    console.log("Socket authentication middleware triggered for socket:", socket.id);
    try {
        const cookies=cookie.parse(socket.handshake.headers.cookie || "");
        const token=cookies.token;


        if(!token){
            return next(new Error("Authentication error: Token not provided"));
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        console.log(decoded);
        const user=await User.findById(decoded.id);
        if(!user){
            return next(new Error("Authentication error: User not found"));
        }
        console.log("Authenticated user:", user.username);
        socket.user=user;
        next();
    } catch (error) {
        console.error("Socket authentication error:", error);
        return next(new Error("Authentication failed: " + error.message));
    }
}

const canJoinConversation=async (conversationId,userId)=>{
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return false;
    }

    const conversation = await Conversation
        .findById(conversationId)
        .select("participants");

    if (!conversation) {
        return false;
    }
    const isParticipant=conversation.participants.some(participant=>{
        return participant.equals(userId)
    })
    return {isParticipant,conversation};

}
module.exports={
    socketAuth,
    canJoinConversation
};