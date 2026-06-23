const express = require("express");
const connectDB = require("./config/database")
const cookieParser = require("cookie-parser");
const requestRouter = require("./routes/requestRoutes");
const profileRouter = require("./routes/profileRoutes");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const conversationRouter = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket/socket");
const { socketAuth, canJoinConversation } = require("./middlewares/socketAuth");
const activeConversations = require("./utils/activeConversations");
const onlineUsers=require("./utils/onlineUsers");

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", conversationRouter);
app.use("/", messageRoutes);


const server = http.createServer(app);
const io = initSocket(server);
io.use(socketAuth);


io.on("connection", (socket) => {

    console.log("connection Established", socket.id);
    const userId=socket.user._id.toString();
    activeConversations.set(userId, null);
    console.log("activeConversations after connection", activeConversations);
    if(!onlineUsers.has(userId)){
        onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);
    socket.broadcast.emit("onlineStatus", true);
    socket.on("getOnlineStatus", (id) => {
        if (onlineUsers.has(id)&& onlineUsers.get(id).size > 0) {
            socket.emit("onlineStatus", true);
        } else {
            socket.emit("onlineStatus", false);
        }
    });
    socket.on("join conversation", async (conversationId) => {

        const { isParticipant, conversation } = await canJoinConversation(
            conversationId,
            socket.user._id
        );

        if (!isParticipant) {
            console.log(`Socket ${socket.id} attempted to join conversation ${conversationId} but was denied access.`);
            return;
        }

        socket.join(conversationId);
        if (!conversation.unreadCount) {
            conversation.unreadCount = new Map();
        }

        conversation.unreadCount.set(socket.user._id.toString(), 0);
        socket.emit("conversation:joined",{conversationId,unreadCount:0,userId:socket?.user._id?.toString()});
        await conversation.save();
        console.log("conversation after reset unread count", conversation);
        activeConversations.set(socket.user._id.toString(), conversationId);
        console.log(
            `Socket ${socket.id} joined room: ${conversationId}`
        );
    });

    socket.on("disconnect", () => {
        console.log("disconnected", socket.id);
        activeConversations.delete(socket.user._id.toString());
        if(onlineUsers.has(userId))
        {
        onlineUsers.get(userId).delete(socket.id);
        if(onlineUsers.get(userId).size===0)
        {
            onlineUsers.delete(userId);
            socket.broadcast.emit("user:statusChanged", { userId, isOnline: false });
        }
        }
        
    });

});

connectDB().then(() => {
    console.log("database connected successfully");
    server.listen(5050, () => {
        console.log("server listening on port 5050");
    })
}).catch((err) => {
    console.log("database can not be connected", err);
});


