const express = require('express');
const path = require('path')
const cors = require('cors');
require('dotenv').config();

//mongodb connection
const connnectDB = require('./databaseConnection');

connnectDB(process.env.MONGODB_URL).then(() => {
    console.log(`connected to mongodb`);
}).catch(err => { console.log('error', err); });


// route imports
const userRouter = require('./routes/user.routes');
const postRouter = require('./routes/post.router');
const commentsRouter = require('./routes/comments.router')
const viewRouter = require('./routes/viewProfile.router')
const verifyUser = require('./middlewares/authorization.middleware');



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))) 

app.get('/', (req, res) => {
    
});

//routes
app.use('/user', userRouter);
app.use('/post', verifyUser, postRouter)
app.use('/comment', verifyUser, commentsRouter)
app.use('/viewProfile', verifyUser, viewRouter )


app.listen(process.env.PORT, () => { console.log(`server started on port ${process.env.PORT}`); });