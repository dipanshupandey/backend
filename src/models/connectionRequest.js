const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const connectionRequestSchema=new Schema({
    fromId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:"User"
    },
    toId:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    status:{
        type:String,
        enum:["interested","skipped","block","rejected","matched"],
        message:`{VALUE} is incorrect status error`
    }
},
{
timestamps:true
});
connectionRequestSchema.index({fromId:1,toId:1});
connectionRequestSchema.pre("save",function(){
    const connectionRequest=this;
    if(connectionRequest.fromId.equals(connectionRequest.toId))
    {
        throw new Error("Cant send request to self!");
    }
})
const connectionRequestModel=mongoose.model("ConnectionRequest",connectionRequestSchema);
module.exports=connectionRequestModel;
