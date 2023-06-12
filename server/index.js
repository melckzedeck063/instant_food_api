const express = require('express');
const mongoose = require('mongoose');
const {MongoClient} = require('mongodb');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const AppError = require('./utils/AppError');
const globalErrorHandler =  require('./controllers/errorController')

dotenv.config({ path: './config.env' })



 const multer = require('multer');
  //const upload = multer({ dest: 'uploads/posts' });

 const  multerStorage =  multer.diskStorage({
     destination :  (req,file,cb) => {
         cb(null, './uploads/posts');
     },
     filename : (req,file,cb) => {
         console.log(file)
         const ext =  file.mimetype.split('/')[1];
         const rand =  Math.floor(Math.random() * 1E9);
         cb(null, `laundry-${rand}-${Date.now()}.${ext}`)
     }
 })

 const multerFilter =  (req,file, cb) =>  {
     console.log(file)
     if(file.mimetype.startsWith('image')){
         cb(null,true)
     }
    else{
        cb(new AppError('The  file  you  uploaded is not supported', 400))
    }
 }

 const  upload =  multer({
    storage : multerStorage,
    fileFilter : multerFilter
 })


const app = express();

app.use(bodyParser.json({limit: '50kb'}))
app.use(cookieParser())
app.use(cors())

if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'))
}

app.use(express.json());


// mongoose.set('strictQuery', false);

//const MongoUrl = `mongodb://localhost:27017/instant_food`;
 const  MongoUrl = `mongodb://${process.env.DB_USERNAME}:${process.env.PASSWORD}@cluster0-shard-00-00.xwzd4.mongodb.net:27017,cluster0-shard-00-01.xwzd4.mongodb.net:27017,cluster0-shard-00-02.xwzd4.mongodb.net:27017/instant_food?ssl=true&replicaSet=atlas-khbsbw-shard-0&authSource=admin&retryWrites=true&w=majority`

mongoose.connect(MongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser : true
})

MongoClient.connect(MongoUrl, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        throw err
    }
    console.log("Successfull connected to the database")
})

const  userRouter = require('./routes/userRoute');
const restaurantRouter =  require('./routes/restaurant_route');
const productRouter =  require('./routes/product_route');
const  cartRouter =  require('./routes/cartItem_route');
const orderRouter =  require('./routes/order_route')


app.use('/api/v1/user', userRouter);
app.use('/api/v1/restaurant', restaurantRouter);
app.use('/api/v1/product', productRouter);
app.use('/api/v1/cart_items',cartRouter);
app.use('/api/v1/orders', orderRouter)


 app.post('/api/v1/posts/upload_photo', upload.single('photo'), (req, res) => {
    // do something with the photo
 //   console.log(req.file)
    const path =  req.file.path;
    if(!path || path === undefined){
       console.log("something went wrong")
    }

    res.status(201).json({
         status : "successfull",
        message : "photo uploaded succesfully",
        data : path
     })
   });

 app.use('/uploads', express.static('uploads'));


app.use(globalErrorHandler);

// console.log(Date.now().toString())

const port = process.env.PORT || 4506;

app.listen(port, () => {
    console.log(`Server running from port ${port}`);
})