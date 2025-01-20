import mongoose from "mongoose";

const projectSchema= new mongoose.Schema({
    project_id:{
        type: Number,
        unique: true,
        required: true,
        trim: true
    },
    name:{
        type:String,
        required: true,
        trim:true
    },
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    ]
    
});

const Project=mongoose.model('project',projectSchema);


export default Project;