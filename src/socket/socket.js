const {Server} =require("socket.io");

let io=null;
const initSocket=(server)=>{
    if(io)    {
        return io;
    }
    io=new Server(server,{
        cors:{
            origin:process.env.FRONTEND_ORIGIN,
            credentials:true,
        }
    })
    return io;
};

const getIO=()=>{
    if(!io)
    {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports={
    initSocket,
    getIO
};