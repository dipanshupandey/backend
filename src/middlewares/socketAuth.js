const jwt=require('jsonwebtoken');
const User=require("../models/user");
const cookie=require("cookie");

const socketAuth=async(socket,next)=>{
    console.log("Socket authentication middleware triggered for socket:", socket.id);
    try {
        const cookies=cookie.parse(socket.handshake.headers.cookie || "");
        const token=cookies.token;
        

        if(!token){
            return next(new Error("Authentication error: Token not provided"));
        }
        const decoded=jwt.verify(token,"MyServerSecret@003");
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
module.exports=socketAuth;