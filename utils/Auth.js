const jwt = require('jsonwebtoken');
const User = require('../schemas/user');
require('dotenv').config()

module.exports = async(req,res,next)=>{
    try {
        const token = req.headers.authorization.replace('Bearer ',''); /// What is a bearer token
        const payload = jwt.verify(token,process.env.JWTKEY);
        const Someuser = await User.findOne({_id:payload._id,'tokens.token':token}) // Imp to know why the second filter is needed.
        if(!Someuser){
            throw new Error();
        }
        req.user = Someuser;
        req.token = token;
        next();
    } catch (e) {
        console.log(e)
        res.status(500).send({error:"Please Authenticate"})
    }
}