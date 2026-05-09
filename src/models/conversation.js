const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ]
}, {
    timestamps: true
});
module.exports=mongoose.model('Conversation',conversationSchema);

