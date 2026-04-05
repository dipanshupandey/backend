const validator = require("validator");

function validateSignUp(req) {
    const body = req.body;
    // if (!body.firstName)
    //     throw new Error("First name can't be empty!");

}

module.exports = {
    validateSignUp
}