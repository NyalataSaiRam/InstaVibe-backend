const User = require("../models/user.schema");

const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const token = await User.MatchPasswordAndGenerateToken(email, password);
        return res.json({ token: token });
    } catch (error) {
        return res.status(401).json({
            error: error
        });
    }
};

const handleSingUp = async (req, res) => {
    const { username, email, password } = req.body;


    try {
        signUpValidation(req.body);
        const user = await User.create({
            username,
            email,
            password,
            posts: 0,
        });
        user.save();
        return res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
};


function signUpValidation(data) {
    if (!data.username || !data.email || !data.password || !data.confirmPassword) throw new Error('All fields are required!');

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const isPatternFollowed = emailRegex.test(data.email);

    if (!isPatternFollowed) throw new Error('Invalid email address!');

    if (data.username?.length < 3) throw new Error('username must be atleast 3 characters long');

    if (data.password?.length < 8) throw new Error('password must be atleast 8 characters long');

    if (data.confirmPassword !== data.password) throw new Error('passwords do not match, try again!');

    return;
}


const getFollowers = async (req, res) => {
    const id = req.params.id;
    const followers = await User.findById(id).populate([ {
        path: 'followers',
        select: 'username profilePic email'
    } ]);

    if (!followers) return res.status(404).json({ msg: "no users found" });

    return res.status(200).json(followers);


};
const getFollowing = async (req, res) => {
    const id = req.params.id;
    const following = await User.findById(id, { following: 1 }).populate([ {
        path: 'following',
        select: 'username profilePic email'
    } ]);

    if (!following) return res.status(404).json({ msg: "no users found" });

    return res.status(200).json(following);
};

const deleteFollowers = async (req, res) => {
    const otherid = req.params.id;
    const myid = req.user.id;

    const me = await User.findByIdAndUpdate(myid, { $pull: { followers: otherid } }, { new: true });
    const other = await User.findByIdAndUpdate(otherid, { $pull: { following: myid } }, { new: true });

    return res.status(200).json({ me, other });

};

const deleteFollowing = async (req, res) => {
    const otherid = req.params.id;
    const myid = req.user.id;

    const me = await User.findByIdAndUpdate(myid, { $pull: { following: otherid } }, { new: true });
    const other = await User.findByIdAndUpdate(otherid, { $pull: { followers: myid } }, { new: true });

    return res.status(200).json(me);
};


module.exports = {
    handleLogin,
    handleSingUp,
    getFollowers,
    getFollowing,
    deleteFollowers,
    deleteFollowing
};