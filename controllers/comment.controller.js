const Comment = require("../models/comment.schema");


const getComments = async (req, res) => {
    const postId = req.params.postId
    const comments = await Comment.find({postId: postId}).populate('userId', {username:1, profilePic:1})

    try {
        return res.status(200).json(comments)
    } catch (error) {
        return res.status(500).json({error: error})
    }
}

const addComment = async (req, res) => {
    
    try {
        await Comment.create({
            postId: req.body.postId,
            userId: req.user.id,
            parentId: req.body.parentId,
            text: req.body.text
        })

        return res.status(201).json({success:true})
        
    } catch (error) {
        return res.status(500).json({success:false, error:error})
    }
}

module.exports = {
    getComments,
    addComment
}