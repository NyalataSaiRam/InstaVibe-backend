const express = require('express');
const { getComments, addComment } = require('../controllers/comment.controller');

const router = express.Router()

router.post('/', addComment)
router.get('/:postId', getComments)

module.exports = router 