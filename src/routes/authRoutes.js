const express=require("express");
const authRouter=express.Router();
const bcrypt=require("bcrypt");
const validator=require("validator");
const  User=require("../models/user");
const {validateSignUp}=require("../utils/validation");

authRouter.post("/user/signup",async (req, res) => {
    try {
        validateSignUp(req);
        const { firstName, lastName, email, password, age, gender } = req.body || {};
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        const newUser = new User({ firstName, lastName, email, password: hashedPassword, age, gender });
        await newUser.save();
        res.send("user created successfully;");
    } catch (error) {
        res.status(400).send("user creation failed " + error);
    }

});

authRouter.post("/user/login", async (req, res) => {
    // console.log("hit");
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            throw new Error("Email and password are required");
        }
        if (!validator.isEmail(email))
            throw new Error("Email format not accepted");
        const user = await User.findOne({ email });
        // console.log(user);
        if (!user) {
            throw new Error("Wrong credentials");
        }
        const isValidPassword = await user.validatePassword(password);
        // console.log(isValidPassword);
        if (!isValidPassword)
            throw new Error("Wrong credentials");


        const token = user.getJWT(); 
        res.cookie("token", token,{
            maxAge:7*24*60*60*1000        
        });
        const userObject=user.toObject();
        delete userObject.password
        res.send({message:"Login successfull",data:userObject});
    } catch (error) {
        res.status(400).send("Error : " + error.message);
    }
});

authRouter.post("/user/logout",(req,res)=>{
try {
    res.cookie("token", "",{
            maxAge :7*24*60*60*1000*0      
        });
    res.send("logout success!");
} catch (error) {
    res.status(500).send({message:"something went wrong! ",error:error.message});
}
});



module.exports=authRouter;
