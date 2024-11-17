const { Schema, model } = require('mongoose');


const commentSchema = new Schema({
    text: {
        type: String,
        required:true
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    parentId:{
        type: Schema.Types.ObjectId,
        ref: 'comment',
        default:null
    },
    postId:{
        type: Schema.Types.ObjectId,
        ref: 'post'
    }
},
{
    timestamps:true
})


const Comment = model('comment', commentSchema);

module.exports = Comment


