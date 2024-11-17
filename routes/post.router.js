const express = require('express');
const { createPost, getPosts, getUserPosts, deletePost, getSpecifiedPosts, searchPost, likePost, getFavourites, savePost, getSavedPosts, getCommentCount, followUser, unfollowUser, RecentPostsFromFollowing } = require('../controllers/post.controller');
const upload  = require('../middlewares/fileUpload.middleware')

const router = express.Router()

//route: post/
//description: gets all the posts
router.get('/', getSpecifiedPosts)

//route: post/myposts
router.get('/myposts', getUserPosts)

//route: post/getCommentcount
router.get('/commentsCount/:id', getCommentCount)


//route: post/savedPost
//description: gets saved posts
router.get('/savedPosts', getSavedPosts)

router.get('/getRecentPostsFromFollowing',RecentPostsFromFollowing)


//route: post/favourites
//description: gets favourite posts
router.get('/favourites', getFavourites)

router.get('/followUser/:id',followUser )
router.get('/unfollowUser/:id',unfollowUser )

//route: post/search
//description: search for posts by keyword
router.get('/search/:query', searchPost)

//route: post/:id
//description: deletes post by id
router.delete('/:id', deletePost)

//route: post/
//description: creates new post
router.post('/', upload.single('file') ,createPost)

//route: post/like/:id
//description: likes a post by id
router.put('/like/:id', likePost)

//route: post/save/id
//description: saves post
router.put('/save/:postId', savePost)







module.exports = router