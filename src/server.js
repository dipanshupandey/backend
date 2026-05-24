const express = require("express");
const connectDB = require("./config/database")
const cookieParser = require("cookie-parser");
const requestRouter=require("./routes/requestRoutes");
const profileRouter=require("./routes/profileRoutes");
const authRouter = require("./routes/authRoutes");
const userRouter= require("./routes/userRoutes");
const conversationRouter=require("./routes/conversationRoutes");
const messageRoutes=require("./routes/messageRoutes");
const cors=require("cors");
const http=require("http");
const {Server}=require("socket.io");
const {initSocket}=require("./socket/socket");
const socketAuth=require("./middlewares/socketAuth");

const app = express();
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

app.use(express.json());
app.use(cookieParser());
app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);
app.use("/",conversationRouter);
app.use("/",messageRoutes);


const server=http.createServer(app);
const io=initSocket(server);
io.use(socketAuth);


io.on("connection",(socket)=>{
    console.log("connection Established",socket.id);
    socket.on("join conversation",(conversationId)=>{
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined room: ${conversationId}`);
    });
  
    socket.on("disconnect",()=>{
        console.log("disconnected",socket.id);
    })
});


connectDB().then(() => {
    console.log("database connected successfully");
    server.listen(5050, () => {
        console.log("server listening on port 5050");
    })
}).catch((err) => {
    console.log("database can not be connected", err);
});


