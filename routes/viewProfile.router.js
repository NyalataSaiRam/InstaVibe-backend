const express = require('express');
const { getPosts, getProfileUserDetails } = require('../controllers/viewProfile.controller');

const router = express.Router()


router.get('/:id', getPosts)

module.exports = router