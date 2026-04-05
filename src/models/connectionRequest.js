const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const connectionRequestSchema=new Schema({
    fromId:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    toId:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    status:{
        type:String,
        enum:["pending","accepted","blocked","rejected"],
        message:`{VALUE} is incorrect status error`
    }
},
{
timestamps:true
});
const connectionRequestModel=mongoose.model("ConnectionRequest",connectionRequestSchema);
module.exports=connectionRequestModel;
