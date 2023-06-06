const catchAsync =   require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const  multer  = require('multer');

const Factory =   require('../controllers/factoryController');
const Product =  require('../models/productModel');


const sendResponse = (statusCode, data,res,message) => {
    res.status(statusCode).json({
        status : 'success',
        message : message,
        data : data
    })
}

const  multerStorage =  multer.diskStorage({
    destination :  (req,file,cb) => {
        cb(null,'./uploads/posts')
    },
    filename : (req,file,cb) => {
        console.log(file)
        const ext =  file.mimetype.split('/')[1];
        const rand =  Math.floor(Math.random() * 1E9);
        cb(null, `product-${rand}-${Date.now()}.${ext}`)
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

exports.uploadPost  =  upload.single('photo');

exports.registerProduct = catchAsync(async (req,res,next) => {
    if(!req.body.created_by) req.body.created_by = req.user.id
    const new_product  = await Product.create(req.body);

    if(!new_product){
        return next(new AppError('Failed to register new product', 400))
    }

    sendResponse(201, new_product, res, 'New product registered succesfully');
})

exports.getAllProduct = Factory.getAll(Product);

exports.updateProduct = Factory.updateOne(Product);

exports.getProductById =Factory.getOne(Product);

exports.deleteProduct =  Factory.deleteModel(Product);

exports.getRestaurantProduct =  catchAsync(  async (req,res,next) => {
    const product  =   await Product.find({prepared_by : req.params.id});

    if(!product){
        return next(new  AppError('No dota found with that  ID', 404));
    }

    res.status(200).json({
        status  :  'success',
        results : product.legth,
        data :  {
            product
        }
    })
} )