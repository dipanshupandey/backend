const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://dipanshupandey4488_db_user:dipanshudb12345@dipanshu.lwfvfqi.mongodb.net/?appName=Dipanshu");
}
module.exports = connectDB;

