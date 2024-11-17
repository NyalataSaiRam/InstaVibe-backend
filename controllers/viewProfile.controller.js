const Post = require("../models/post.schema");
const User = require("../models/user.schema");
const { countComments } = require("./post.controller");

const getPosts = async (req, res) => {
    const id = req.params.id;
    const posts = await Post.find({ userId: id });
    const userDetials = await User.findById(id)
    if (!posts) return res.status(404).json({ msg: 'No post found' });
    if (!userDetials) return res.status(404).json({ msg: 'No post found' });

    const updated_posts = await Promise.all(
        posts.map(async (post) => {
          const commentsCount = await countComments(post._id); // Assuming this is an async function
          return { ...post.toObject(), commentsCount }; // Use `toObject()` to ensure Mongoose document is a plain object
        })
      );

    return res.status(200).json({updated_posts, userDetials});
};



module.exports = {
    getPosts
};