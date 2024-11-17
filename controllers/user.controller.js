const User = require("../models/user.schema");
const fs = require('fs')
const path = require('path')

const updateProfile = async (req, res) => {
    let pd = JSON.parse(req.body.profileData);
    let user = await User.findById(req.user.id);
    if(req.file?.filename){
        if(user.profilePic !== 'defaultProfileImg.jpg'){
            fs.unlink(path.join(__dirname,'..', 'public', 'uploads', user.profilePic), (err) => {
                if(err){ 
                   console.log(err)
                }
            })
        }

        try {
            await User.findByIdAndUpdate(req.user.id, {
                username: pd.username,
                profilePic: req.file.filename,
                description: pd.description
            });
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: error });
        }
    }else{

        try {
            await User.findByIdAndUpdate(req.user.id, {
                username: pd.username,
                description: pd.description
            });
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: error });
        }
    }
 
};

const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id, { password: 0, salt: 0, __v:0 });
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({error: error})

    }
};



module.exports = {
    updateProfile,
    getUserDetails
};