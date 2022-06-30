// const {MongoClient,ObjectId} = require('mongodb');
// const url = "mongodb://localhost:27017/";
// const mydb = 'smartypants';

// MongoClient.connect(url, function(err, dbClient) {
//   if (err){
//       return console.log(err)
//   }
//   const db = dbClient.db(mydb);
//   console.log("Database created!");


// }); // Without using to mongoose, this is thow we connect to the server.
const User = require('./schemas/user');
const Task = require('./schemas/task');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
mongoose.connect('mongodb://localhost:27017/smartyPants').then(()=>{
    console.log("Database connected.")
}).catch((e)=>{
    throw e;
})
 const multer = require('multer');
 const upload = multer({ 
     dest: 'uploads/',
     limits:{fileSize:100000},
     fileFilter: (req,file,cb)=>{
         if(file.mimetype=='image/jpg'||file.mimetype=='image/jpeg'||file.mimetype=='image/png'){
             cb(null,true)
         } else {
             cb(null,false);
             cb(new Error("File must be png, jpeg or jpg"))
         }
     } 
    }).single('demo-image');


 app.post('/image',(req,res,next)=>{
     upload(req,res,(err)=>{
         if(!err) res.send(req.file)
         else res.send({error:err.message})
     })
 })

 app.listen(3000,async()=>{
     console.log('Server Listening on port 3000')
 })

