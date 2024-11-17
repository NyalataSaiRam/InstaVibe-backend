const { Schema, model } = require('mongoose');

const postSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    tags: [
        {
            type: String,
            required: true
        }
    ],
    displayImg: {
        type: String,
        required: true
    },
    title:{
        type:String,
        required: true
    }

}, {
    timestamps: true
});


const Post = model('post', postSchema);

module.exports = Post;
