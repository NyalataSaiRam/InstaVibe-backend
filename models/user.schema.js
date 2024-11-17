
const { Schema, model } = require('mongoose');
const { createHmac, randomBytes } = require('crypto');
const { createUserToken } = require('../services/auth.service');

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    salt: {
        type: String
    },
    savedPosts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'post'
        }
    ],
    favourites: [
        {
            type: Schema.Types.ObjectId,
            ref: 'post'
        }
    ],
    profilePic: {
        type: String,
        default: 'defaultProfileImg.jpg'
    },
    description: {
        type: String
    },
    posts:
    {
        type: Number

    }

}, {
    timestamps: true
});

userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return;

    const salt = randomBytes(16).toString();
    const passwordHash = createHmac('sha256', salt).update(user.password).digest('hex');

    this.salt = salt;
    this.password = passwordHash;

    next();

});

userSchema.static('MatchPasswordAndGenerateToken', async function (email, password) {
    const user = await User.findOne({ email });

    if (!user) throw new Error('user not found');

    const salt = user.salt;
    const userPassword = user.password;

    const hash = createHmac('sha256', salt).update(password).digest('hex');

    if (hash !== userPassword) throw new Error('Invalid user credentials');

    const token = createUserToken(user);
    return token;
});


const User = model('user', userSchema);

module.exports = User

