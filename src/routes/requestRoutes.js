const express=require("express");
const requestRouter=express.Router();
const userAuth= require("../middlewares/auth");
const connectionRequestModel=require("../models/connectionRequest");
const {validateRequest}=require("../utils/validation");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {

    try {
        const fromId=req.user._id;
        const toId=req.params.toUserId;
        const status=req.params.status;
        await validateRequest(fromId,toId,status);

        const connectionRequest=new connectionRequestModel({
            fromId,
            toId,
            status
        })
        console.log(connectionRequest);
        const data=await connectionRequest.save();
        return res.json({
            message:"Success",
            data:data
        });
    } catch (error) {
        res.status(400).send("Error "+error.message);
    }

});

requestRouter.post("/request/review/:status/:requestId",userAuth,async (req,res)=>{
    try {
    const allowedStatuses=["rejected","matched","block"];
    const status=req.params.status;
    const requestId=req.params.requestId;
    if(!allowedStatuses.includes(status))
    {
        return res.status(400).json({message:"invalid status"});
    }
    const requestObject=await connectionRequestModel.findOne({
        _id:requestId,
        status:"interested",
        toId:req.user._id
    });
    if(!requestObject)
    {
        return res.status(400).json({message:"Invalid request!"});
    }
    requestObject.status=status;
    await requestObject.save();
    return res.json({message:"request review successfull!",data:requestObject});
    } catch (error) {
        return res.status(500).send(error.message);
    }
})

module.exports=requestRouter;