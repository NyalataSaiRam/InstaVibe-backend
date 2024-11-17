const mongoose = require('mongoose');

const connnectDB = async (url) => {
    return await mongoose.connect(url);
};

module.exports = connnectDB;