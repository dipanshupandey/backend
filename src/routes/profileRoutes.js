const express = require("express");
const profileRouter = express.Router();
const userAuth = require("../middlewares/auth");
const {validateUpdateProfile}=require("../utils/validation");

profileRouter.get("/profile", userAuth, async (req, res) => {
    console.log(req.cookies);
    res.send(req.user);
});

profileRouter.patch("/profile/update", userAuth, async (req, res) => {
    try {
        validateUpdateProfile(req);
        const loggedInUser = req.user;
        console.log(loggedInUser);
        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });
        await loggedInUser.save();
        res.json({
            message: `${loggedInUser.firstName} profile updated successfully`,
            data: loggedInUser
        });

    } catch (error) {
        res.send("ERROR : " + error.message);
    }
})
module.exports = profileRouter;

