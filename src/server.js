const express = require("express");
const connectDB = require("./config/database")
const app = express();
const cookieParser = require("cookie-parser");
const requestRouter=require("./routes/requestRoutes");
const profileRouter=require("./routes/profileRoutes");
const authRouter = require("./routes/authRoutes");

app.use(express.json());
app.use(cookieParser());
app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);


 
connectDB().then(() => {
    console.log("database connected successfully");
    app.listen(5050, () => {
        console.log("server listening on port 5050");
    })
}).catch((err) => {
    console.log("database can not be connected", err);
});


