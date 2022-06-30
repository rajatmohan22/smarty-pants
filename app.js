const express = require('express');
const Router = require('express').Router()
const app = express();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGOURI).then(()=>{
    console.log("Database connected.")
}).catch((e)=>{
    throw e;
})
const port = 3000||process.env.port;
const bodyParser = require('body-parser');
const User = require('./schemas/user');
const Task = require('./schemas/task');
app.use(bodyParser.urlencoded({ extended: true }));
const user = require('./routes/users');
const task = require('./routes/tasks');
const jwt = require('jsonwebtoken');
const Auth = require('./utils/Auth')

app.use('/users',user);
app.use('/tasks',task);

app.listen(port,()=>{
    console.log(`Server listening on port ${port}`)
})
