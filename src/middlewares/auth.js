const JWT = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    console.log(req.cookies);
    const token = req.cookies.token;
    try {
        if (!token) {
            return res.status(401).json({ error: "Please login!" });
        }
        // console.log(token);
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        const Id = decoded.id;
        const fetchedUser = await User.findById(Id);
        if (!fetchedUser )
            return res.status(404).json({ error: "User not found!" });
        req.user = fetchedUser;
        next();
    } catch (err) {
        return res.status(401).json({ error: err.message });
    }
};

module.exports =  userAuth;