const mongoose = require('mongoose')
const { Schema,model } = mongoose;

const taskSchema = new Schema({
    desc: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
},{
    timestamps:true
})


module.exports = new model('task',taskSchema);