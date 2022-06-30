const mongoose = require('mongoose')
const { Schema,model } = mongoose;
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
require('dotenv').config()
const Task = require('./task');

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique:true,
        trim: true,
        validate:{
            validator: function(value){
                return isEmail(value)
            },
            message: "Not a valid email."
        }
    },
    age: {
        type: Number,
        default:0,
        validate:{
            validator: function(value){
                return value>0
            },
            message: "Age must be greater than 0."
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator : function(value){
                return !value.includes("password")
            },
            message: "Passoword must not contain the word password"
        },
        minlength: 7
    },
    tokens:[{
        token:{
            type: String,
            required:true
        }
    }],
    avatar:{
        type: Buffer
    }
},{
  timestamps: true 
})

userSchema.pre('save',async function(next){
    const user = this;
    if(user.isModified('password')){ 
        const hash =  await bcrypt.hash(user.password, saltRounds);
        user.password = hash;
    }
    next();
})

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const data = {
        _id: user.id.toString()
    }
    const token = jwt.sign(data, process.env.JWTKEY);
    user.tokens.push({token})
    await user.save(); // coz we are modifying the instance.
    return token
}

userSchema.methods.toJSON = function(){
     const user = this;
     const userObj = user.toObject();
     delete userObj.password;
     delete userObj.tokens;
     delete userObj.avatar
    //  console.log(userObj)
     return userObj
}

userSchema.statics.findByCreds = async function(email,password){
    const foundUser = await this.findOne({email});
    if(!foundUser) throw new Error("No User Found.");
    const match= await bcrypt.compare(password, foundUser.password);
    if(match){
        return foundUser;
    } throw new Error()  
}

userSchema.virtual('tasks',{
    ref:'task',
    localField:'_id',
    foreignField:'owner',
    // justOne: false /// it is false by default only.
})

userSchema.pre('deleteOne',async function(next){
    const user = this; /// this cant be post because once you delete the user, you will lose access to 'this'
    await Task.deleteMany({owner:user._id});
    next();
})
//Mongoose will populate documents from the model in ref whose foreignField matches this document's localField.



// const doggy = {
//     name: "pluto",
//     breed: "golden"
// }

// doggy.toJSON = function(){
//     console.log(this)
//     return this;
// }

// doggy.toJSON = function(){
//     return {status:"ok"}
// }

// console.log(JSON.stringify(doggy))

module.exports = new model('user',userSchema);