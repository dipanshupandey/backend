const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const JWT=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 50,
        trim: true,
    },
    lastName: {
        type: String,
        minLength: 2,
        maxLength: 50,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: "mail format not accepted",
        }
    },
    age: {
        type: Number,
        min: 15
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "others"],
            message: "{VALUE} is not a valid gender",

        },
        required: true,
    }
    ,
    password: {
        type: String,
        required: true,
        minLength: 8,
        validate: {
            validator: function (value) {
                return validator.isStrongPassword(value);
            },
            message: "Password too weak"
        }
    },
    about: {
        type: String,
        maxLength: 200,
        trim: true
    },
    photoURL: {
        type: String,
        default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAY1BMVEUAAAD///9fX19PT0/x8fF/f3/8/Pz5+fmtra15eXkeHh6IiIinp6fn5+fk5OTNzc0LCwvFxcVXV1dkZGSfn59JSUlqamrb29s3NzcjIyO4uLgXFxcpKSmVlZVzc3MvLy9BQUEnjlp0AAAEd0lEQVR4nO2c6XKjMAyAnWAgB4QjEBJyvv9Tblk2kwC20WFDd4bvf9tvwJZlSVSsuMgq2/j5+ZKml3Pub7JKsn+l4P14UG+9q+hw9bZ1MJ9UkGyFhm3C8WJIZUedUsMxm0EqKU1KDWUysZTcjyk17IlrniaV7CBOQuxoD4skVaQwJyHSYiKp0IcqNfjhJFI5xkmIfAKpcI1zEmKNflZoKWNwUnN0LQUKBX32bqU2FCchNi6lDjQnIQ7upELkxvuQoxY7SiqiOgkRuZKK6U5CxI6kSDvvDWYHIqQqjpMQlRMp1oNCPSq4lASnBmpSeHIFlyLGzQ/wCAqWCk9cqRM4VoGlWPGgBRwVwFIZXwp8vwFLPfhSD+tSN77UzbZUDLy/mNhBFxVUKmFGqYYUeuGCStV8JyFqy1KMrOUDNH+BSt1tSN0tSzFP4xbombxI2Zb6lWuqsCEFLcFApdjZVAM0o4JKWUgS4GnCf332BRe+1AVaxganLuiy1JA19G+BpSysdPDNASxFLrh8AJdewFLS4zp54Isf/N7HDp/w6jVcillKwBQTELUE5v4D7z2UVMKTQnREMPUp1tUPfOlDSrEeFaZ1hKp5opoyXXzM30FJHZ5UpyeqZo2ro5MTGFzvFtlxIL5A1MtDS+F7WA3YPha2YRQSkr0dtreGbq0d0DWhG64xQ5HC1xkxvQaq1CoenUj4xsM7kbrtmNWO79USpVYBuDAUkUZeiBMcCSgP9YiDJdRZlxCQiBaUV8eRasZdjCfhkzrowpL6CVmFVutZoIOTJam/Y13lIMTvSt5IF3v87WdxJbX/1e/O/TqhLiV7Uv+Qh6o68EcEW2xJWWWRgkKRknGVRfe7f/QMHP37PcqqmLLO8PnU5pG/xqP5m1f+2LjNp+L6RGpmpacalcBgru3+mWLUcvYdXNtlxK7E7iLo+oJJBcWLq9TwKmDHD0QqtNLsa4kgZxBAqiKPcqnIAbWzUSnJqGqo8UeX1phUxa6/DvHGHtaIlJU+0ZCRirpRKmAP3eg4GbehSUpaaH3oWJsWlkFKkktkEJ4GK73UgXGoQDjrz2mtFHfabRz9PJxOSqKqGDRKnZVGKnAQnoZ4mj2okbIextVoaqFqKYsnsBn1SI5Sit2wgqM8cVRSUyzyN8rFrpKaaEG1qJaVQorZQsOiyN2HUiHhew8Ox2EuOpSabOe9Ge7AgVRgYaATx20QQgdSVmaScAza8H0p+Zpe6tUPC30pR/mvmX523JdynESpOZulrMxu4cmMUlaGFPHsTVJy8njQcpMGqZneXv/9daWc3fPGOOmlgln2XsM50EpV1/Efd8O10krNEjlbNlqpSbO7Lr5Oiv6hI5/Op5LfUu4vxXo61+VvKQtfNtGJNVITJ+ddEo3UjJuvu/2+pWZIOj8UGqmZUoSWvUZK+79HpmCrkZrtOG44aaQc1l3HWS9Si9QitUgtUovUIrVILVKL1CL1X0j9yivWr6wlhBO2afuUuvrUKp5kGkFF95uRXnE/KmconKVlb67xD9XuPj0EmhyhAAAAAElFTkSuQmCC"
    },
    skills: {
        type: [String],
        default: [],
        validate: {
            validator: function (value) {
                return value.length <= 10;
            },
            message: "Skills can't be more than 10"
        }
    }
}, { timestamps: true });

userSchema.methods.getJWT=function (){
    const user = this;
    const token=JWT.sign({
        id:user._id
    },
    "MyServerSecret@003",
    {
        expiresIn:"7d"
    }
)
console.log(token);
return token;
}

userSchema.methods.validatePassword=async function(password){
    const user=this;
    const hashedPassword=this.password;
    const isValidPassword= await bcrypt.compare(password,hashedPassword);
    console.log(isValidPassword);
    return isValidPassword;
}
const User = mongoose.model("User", userSchema);
module.exports = User;

