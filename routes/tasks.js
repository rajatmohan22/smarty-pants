const express = require('express');
const User = require('../schemas/user');
const Task = require('../schemas/task');
const Auth = require('../utils/Auth');
const router = express.Router()

// It's the new ES2015 (the EcmaScript spec formally known as ES6) computed property name syntax. 
///It's a shorthand for the someObject[someKey] assignment that you know from ES3/5:

// var a = "b"
// var c = {[a]: "d"} //as andrew says "Dynamic"
// is syntactic sugar for:

// var a = "b"
// var c = {}
// c[a] = "d"

router.route('/')
.get(Auth,async(req,res)=>{

    try{
        // const allTasks = await Task.find({owner:req.user._id});
        // if(!allTasks) return res.send('No Tasks')
        // res.send(allTasks)
        var match = {};
        var {completed,skip,limit,sortBy} = req.query;
        match.completed = (completed === 'true')
        if(!match.completed) match = {}
        console.log(req.query.sortBy)

        var temp = sortBy
        if(sortBy){
            temp = temp.split(':')
        } else {
            temp = {}
        }

        temp[1]==='desc'?temp[1]=-1:temp[1]=1;
        console.log(temp[1]);
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                skip:parseInt(skip),
                limit: parseInt(limit),
                sort:{
                    [temp[0]]: temp[1] /// brackets are imp lmao
                }
            }
        })
        res.send(req.user.tasks);
    } catch(e){
        console.log(e)
        res.status(500).send();
    }
    

})
.post(Auth,async(req,res)=>{
    var newTask = new Task({...req.body,owner:req.user._id})
    var newTask =await newTask.populate('owner');
    // console.log(newTask)
    await newTask.save()
    res.send(newTask);
})


router.route('/:id')
.get(Auth,async(req,res)=>{
    try{
        const {id} = req.params;
        const foundTask = await Task.findOne({_id,owner:req.user._id})
        if(!foundTask) return res.send(404).send()
        res.send(foundTask);
    }
    catch(e){
        res.status(404).send()
    }
   
})
.patch(Auth,async(req,res)=>{
    const allowedUpdates = ['desc','completed'];
    const updates = Object.keys(req.body);
    const validateUpdate = updates.every((update)=>{
        if(allowedUpdates.includes(update)) return true
        return false
    })

    if(!validateUpdate) return res.status(400).send();

    try{
        const {id} = req.params;
        const findTask = await Task.findOne({_id:id,
            owner:req.user._id
        });
        if(!findTask) return res.status(400).send()
        updates.forEach((update)=>{
            findTask[update]=req.body[update]
        })
        findTask.save();
        res.send(findTask);
        if(!findTask) return res.status(404).send();
}
    catch(e){
        res.status(500).send();
    }
})

.delete(Auth,async(req,res)=>{
    try{
        const {id} = req.params;
        const findTask = await Task.findOneAndDelete({_id:id,owner:req.user._id})
        if(!findTask) return res.status(404).send();
        res.send(findTask);

    } catch(e){
        res.status(500).send()
    }
})

module.exports = router;