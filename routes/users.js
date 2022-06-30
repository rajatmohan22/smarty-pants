const express = require('express');
const router = express.Router()
const User = require('../schemas/user');
const Task = require('../schemas/task');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const Auth = require('../utils/Auth');
const multer = require('multer');
const {welcomeEmail,cancelEmail} = require('../emails/test')
const sharp = require('sharp')
const upload = multer({
    // dest:'avatars/',
    limits: {
        fileSize:1000000
    },fileFilter: (req,file,cb)=>{
        if(file.mimetype=='image/jpg'||file.mimetype=='image/jpeg'||file.mimetype=='image/png'){
            cb(null,true)
        } else {
            cb(null,false);
            cb(new Error("File must be png, jpeg or jpg"))
        }
    }
}).single("avatar");

router.route('/me')
.get(Auth,async(req,res)=>{
    res.send(req.user)
})
.post(async(req,res)=>{
    const newUser = new User(req.body);
    try{
        
        await newUser.save();
        welcomeEmail(newUser.email,newUser.name);
        const token=await newUser.generateAuthToken();
        res.status(201).send({newUser,token})

    } catch(e){
        res.status(500).send(e.message)
    }
     
})
.delete(Auth,async(req,res)=>{
    try{
        
      const deletedUser=  await req.user.remove();
      cancelEmail(deletedUser.email,deletedUser.name)
      res.send(deletedUser)

    } catch(e){
        res.status(500).send()
    }

})

router.route('/:id')
.patch(Auth,async(req,res)=>{

    const updates = Object.keys(req.body); ///This returns an array.
    const allowedUpdates = ['name','email','age','password']
    const validateUpdate = updates.every((update)=>{
        if(allowedUpdates.includes(update)) return true;
        return false
    })
    try{
        if(validateUpdate){
            const {id} = req.user;
            const foundUser = await User.findById(id);
            updates.forEach((update)=>{
                foundUser[update] = req.body[update]; ///Very important line of code.
            })
            
            req.user = foundUser;
            req.user.save();
            return res.send(foundUser)

            // const foundUser = await User.findByIdAndUpdate(id,req.body,{new:true,runValidators:true}); /// wont work with the mongoose middleware.
        }
        return res.status(400).send()
    }
    catch(e){
        res.status(500).send()
    }

})

router.route('/login')
.post(async(req,res)=>{
    try{
        const {email,password}=req.body;
        const foundUser=await User.findByCreds(email,password)
        const token=await foundUser.generateAuthToken(); /// this is the difference between using statics and methods.
        res.send({foundUser,token});  ///res.send calls JSON.toStringify() 
    } catch(e){
        res.status(500).send("Password or email incorrrect")
    } 
})

router.route('/logout')
.post(Auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.route('/logout/all')
.post(Auth,async(req,res)=>{
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send()
    } catch (error) {
        res.status(500).send("Failed to logout")
    }
})

router.route('/me/avatar')
.post(Auth,async(req,res)=>{
    upload(req,res,async(err)=>{
        try{
            if(!err){
                if(req.file){
                    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
                    req.user.avatar = buffer
                    res.send(req.user.avatar)
                    await req.user.save()
                    return res.send()
                }
                else throw new Error("Please upload an image") 
            }
            return res.send({error:err.message});
        } catch(e){
            res.send({error:e.message})
        }
    })
})

.delete(Auth,async(req,res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send()
})

router.route('/:id/avatar')
.get(Auth,async(req,res)=>{
    const {id} = req.params;
    console.log(id)
    try {
        const user = await User.findById(id)
        console.log(id)
        if(!user||!user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/jpg');
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})
module.exports = router;