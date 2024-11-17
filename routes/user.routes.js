const express = require('express');
const { handleLogin, handleSingUp, getFollowers, getFollowing, deleteFollowers, deleteFollowing } = require('../controllers/login.controller');
const verifyUser = require('../middlewares/authorization.middleware');
const { getUserDetails, updateProfile } = require('../controllers/user.controller');
const upload = require('../middlewares/fileUpload.middleware');

const router = express.Router();

router.get('/', (req, res) => {
    return res.end('user route');
});

router.post('/login', handleLogin);
router.post('/signup', handleSingUp);


router.get('/followers/:id', verifyUser, getFollowers )
router.get('/following/:id', verifyUser, getFollowing)

router.delete('/followers/:id', verifyUser, deleteFollowers )
router.delete('/following/:id', verifyUser, deleteFollowing)


//get user details
router.get('/details', verifyUser, getUserDetails);


//change user profile data
router.put('/', verifyUser, upload.single('file'), updateProfile);


module.exports = router;