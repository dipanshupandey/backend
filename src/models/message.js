const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const messageSchema=new Schema({
    text:{
        type:String,
        required:true,
        trim:true,
    },
    senderId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"User",
    },
    seen:{
        type:Boolean,
        default:false,
    },
    conversationId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"Conversation",
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
    
},
{
    timestamps:true,
})