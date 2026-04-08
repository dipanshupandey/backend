const validator = require("validator");
const connectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");

function validateSignUp(req) {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || firstName.trim().length < 2) {
        throw new Error("First name must be at least 2 characters long");
    }

    if (!lastName || lastName.trim().length < 2) {
        throw new Error("Last name must be at least 2 characters long");
    }

    if (!email) {
        throw new Error("Email is required");
    }
    if (!validator.isEmail(email)) {
        throw new Error("Invalid email format");
    }


    if (!password) {
        throw new Error("Password is required");
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error(
            "Password must be strong (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol)"
        );
    }
}


function validateUpdateProfile(req) {
    const allowedFields = ["firstName", "lastName", "about", "photoURL", "skills"];
    const updates = Object.keys(req.body);


    const isAllowed = updates.every((field) =>
        allowedFields.includes(field)
    );

    if (!isAllowed) {
        throw new Error("Invalid update fields");
    }

    const { firstName, lastName, about, photoURL, skills } = req.body;


    if (firstName && firstName.trim().length < 2) {
        throw new Error("First name must be at least 2 characters long");
    }


    if (lastName && lastName.trim().length < 2) {
        throw new Error("Last name must be at least 2 characters long");
    }


    if (about && about.length > 200) {
        throw new Error("About cannot exceed 200 characters");
    }


    if (photoURL && !validator.isURL(photoURL)) {
        throw new Error("Invalid photo URL");
    }


    if (skills.length > 10) {
        throw new Error("Skills can't be more than 10");
    }
}
async function validateRequest(fromId, toId, status) {
    if (status != "interested" && status != "skipped") {
        throw new Error("Invalid status");
    }
   
    const existingRequest = await connectionRequestModel.findOne({$or:[
        { fromId, toId },
        { fromId: toId, toId: fromId }
    ]});
    if (existingRequest) {
        throw new Error("Duplicate request");
    }
    const user = await User.findById(toId);
    if (!user) {
        throw new Error("User not found!");
    }
    
    return true;
}
module.exports = {
    validateSignUp,
    validateUpdateProfile,
    validateRequest
};