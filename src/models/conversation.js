const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: {
        type:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
        ],
        validate:{
            validator:(value)=>{
               return value.length===2;
            },
            message:"Participants can be exactly 2!"
        },
        
    },
    lastMessage:{
        type:String
    },

    lastMessageAt:{
        type:Date
    },
    conversationKey:{
        type:String,
        unique:true
    },
    unreadCount:{
        type: Map,
        of: Number,
        default: {}
    }
}, {
    timestamps: true
});

conversationSchema.pre("save", function(){
    const sortedParticipant=this.participants.map(id=>id.toString()).sort();
    this.conversationKey=sortedParticipant.join("_");
    // console.log("saved");
  
})
module.exports=mongoose.model('Conversation',conversationSchema);

