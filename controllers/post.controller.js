const Comment = require("../models/comment.schema");
const Post = require("../models/post.schema");
const User = require("../models/user.schema");
const path = require('path');
const fs = require('fs').promises;

const createPost = async (req, res) => {

    const formValues = JSON.parse(req.body.formData);

    const tagsArr = formValues.tags.split(" ");

    try {

        const post = await Post.create({
            userId: req.user.id,
            title: formValues.title,
            likes: [],
            tags: tagsArr,
            displayImg: req.file.filename
        });

        await User.findByIdAndUpdate(req.user.id, { $inc: { posts: 1 } });


        res.status(200).json({ success: true });
    } catch (error) {
        res.status(200).json({ success: false });

    }

};

// const getPosts = async (req, res) => {
//     const posts = await Post.find({});
//     return res.status(200).json(posts);

// };

const getSpecifiedPosts = async (req, res) => {
    const page = req.headers[ 'x_page' ];
    const size = 6;
    const skip = (page - 1) * size;
    const posts = await Post.find({}).populate('userId', { profilePic: 1, username: 1 }).sort({ createdAt: -1 }).skip(skip).limit(size);
    const updated_posts = await Promise.all(
        posts.map(async (post) => {
            const commentsCount = await countComments(post._id); // Assuming this is an async function
            return { ...post.toObject(), commentsCount }; // Use `toObject()` to ensure Mongoose document is a plain object
        })
    );

    return res.status(200).json(updated_posts);
};

const getUserPosts = async (req, res) => {
    const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const updated_posts = await Promise.all(
        posts.map(async (post) => {
            const commentsCount = await countComments(post._id); // Assuming this is an async function
            return { ...post.toObject(), commentsCount }; // Use `toObject()` to ensure Mongoose document is a plain object
        })
    );
    return res.status(200).json(updated_posts);
};

const deletePost = async (req, res) => {

    const filename = await Post.findById(req.params.id, { displayImg: 1 });
    console.log(filename);
    try {
        const filePath = path.join(__dirname, '..', 'public', 'uploads', filename.displayImg);
        await fs.unlink(filePath);

    } catch (err) {

        return res.status(500).json({ msg: err });
    }


    await Post.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user.id, { $inc: { posts: -1 } });
    return res.status(200).json({ msg: "post deleted" });
};

const countComments = async (postId) => {
    const count = await Comment.countDocuments({ postId: postId });
    return count;
};

const getCommentCount = async (req, res) => {
    const count = await countComments(req.params.id);
    return res.status(200).json(count);
};

const searchPost = async (req, res) => {
    const query = req.params.query;

    try {
        const posts = await Post.find({ tags: { $elemMatch: { $regex: new RegExp(`^${query}.*`, 'i') } } }).populate('userId', { username: 1, profilePic: 1 });
        const updated_posts = await Promise.all(
            posts.map(async (post) => {
                const commentsCount = await countComments(post._id); // Assuming this is an async function
                return { ...post.toObject(), commentsCount }; // Use `toObject()` to ensure Mongoose document is a plain object
            })
        );
        return res.status(200).json({ posts: updated_posts });

    } catch (error) {
        return res.status(500).json({ error: error });

    }
};

const likePost = async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ msg: 'Post does not exist' });

    const isLiked = post.likes.includes(req.user.id);
    const updatedLikes = isLiked
        ? post.likes.filter(like => like.toString() !== req.user.id)
        : [ ...post.likes, req.user.id ];

    // Update the post and return updated likes
    await Post.findByIdAndUpdate(id, { likes: updatedLikes }, { new: true });

    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ msg: "user does not exist" });

    const isFavourite = user.favourites.includes(id);
    const updatedFavorites = isFavourite
        ? user.favourites.filter(f => f.toString() !== id)
        : [ ...user.favourites, id ];

    await User.findByIdAndUpdate(req.user.id, { favourites: updatedFavorites }, { new: true });

    return res.status(200).json(updatedLikes); // Return the updated likes array
};

const getFavourites = async (req, res) => {
    const favouritePosts = await User.findById(req.user.id, { favourites: 1 }).populate([
        {
            path: 'favourites',
            populate: {
                path: 'userId',
                select: 'username profilePic'
            }
        }
    ]);
    const updated_posts = await Promise.all(
        favouritePosts.favourites.map(async (post) => {
            const commentsCount = await countComments(post._id); // Assuming this is an async function
            return { ...post.toObject(), commentsCount }; // Use `toObject()` to ensure Mongoose document is a plain object
        })
    );
    return res.status(200).json(updated_posts);
};

const savePost = async (req, res) => {
    const id = req.params.postId;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isSaved = user.savedPosts.includes(id);

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { savedPosts: isSaved ? user.savedPosts.filter(pid => pid.toString() !== id) : [ ...user.savedPosts, id ] }, { new: true });

    return res.status(200).json(updatedUser);
};

const getSavedPosts = async (req, res) => {
    const posts = await User.findById(req.user.id, { savedPosts: 1 }).populate([
        {
            path: 'savedPosts',
            populate: {
                path: 'userId',
                select: 'username profilePic'
            }
        }
    ]);
    if (!posts) return res.status(404).json({ msg: 'user not found' });

    const updated_posts = await Promise.all(
        posts.savedPosts.map(async (post) => {
            const commentsCount = await countComments(post._id); // Assuming this is an async function
            return { ...post.toObject(), commentsCount }; // Use `toObject()` to ensure Mongoose document is a plain object
        })
    );

    return res.status(200).json(updated_posts);
};


const followUser = async (req, res) => {
    const otherid = req.params.id;
    const myid = req.user.id;

    const me = await User.findByIdAndUpdate(myid, { $push: { following: otherid } }, { new: true });
    const other = await User.findByIdAndUpdate(otherid, { $push: { followers: myid } }, { new: true });

    return res.status(200).json({ me, other });
};

const unfollowUser = async (req, res) => {
    const otherid = req.params.id;
    const myid = req.user.id;

    const me = await User.findByIdAndUpdate(myid, { $pull: { following: otherid } }, { new: true });
    const other = await User.findByIdAndUpdate(otherid, { $pull: { followers: myid } }, { new: true });

    return res.status(200).json({ me, other });

};

const getRecentPostsFromFollowingWithCommentsCount = async (userId) => {
    try {
        // Find the user and get the following array
        const user = await User.findById(userId).select('following');

        if (!user || user.following.length === 0) {
            return []; // Return empty array if no following users found
        }

        // Aggregation pipeline to get posts with comments count, username, and profilePic
        const recentPosts = await Post.aggregate([
            {
                $match: {
                    userId: { $in: user.following }
                }
            },
            {
                $sort: { createdAt: -1 } // Sort by creation date (newest first)
            },
            {
                $limit: 6 // Limit to first 6 posts
            },
            {
                $lookup: {
                    from: 'comments', // Collection to join for comments
                    localField: '_id', // Field from Post schema
                    foreignField: 'postId', // Field in Comment schema
                    as: 'comments'
                }
            },
            {
                $addFields: {
                    commentsCount: { $size: '$comments' } // Add comments count field
                }
            },
            {
                $lookup: {
                    from: 'users', // Collection to join for user details
                    localField: 'userId', // Field from Post schema
                    foreignField: '_id', // Field in User schema
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails' // Flatten userDetails array
            },
            {
                $addFields: {
                    username: '$userDetails.username',
                    profilePic: '$userDetails.profilePic'
                }
            },
            {
                $project: {
                    comments: 0, // Exclude comments array if not needed
                    userDetails: 0 // Exclude userDetails array
                }
            }
        ]);

        return recentPosts;
    } catch (error) {
        console.error("Error fetching recent posts with comments count and user info:", error);
        throw error;
    }
};



const RecentPostsFromFollowing = (req, res) => {
    const userId = req.user.id;
    getRecentPostsFromFollowingWithCommentsCount(userId).then((recentPosts) => {
        return res.status(200).json(recentPosts);
    }).catch((error) => {
        return res.status(500).json({ message: "Error fetching recent posts from following" });
    });
};
            




module.exports = {
    createPost,
    getUserPosts,
    deletePost,
    getSpecifiedPosts,
    searchPost,
    likePost,
    getFavourites,
    savePost,
    getSavedPosts,
    getCommentCount,
    countComments,
    followUser,
    unfollowUser,
    RecentPostsFromFollowing
};