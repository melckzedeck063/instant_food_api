const mongoose =  require('mongoose');
const  validator =  require('validator');

const ProductSchema =  mongoose.Schema({
    productName  : {
        type : String,
        required : [true, 'Product name is required'],
        trim :  true
    },
    quantity :  {
        type : Number,
        required  : [true, 'Product  quantity is required']
    },
    price  :  {
        type  :  String,
        required :  [true, 'Product price is required'],
        trim : true
    },
    photo : {
        type : String
    },
    description : {
        type : String
    },
    status : {
        type : String,
        default  : "Available"
    },
    deleted :  {
        type  : String,
        default  : false
    },
    date_published : {
        type  :  Date,
        default :  Date.now()
    },
    created_by : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : [true, "creator name is required"],
        trim  : true
    },
    prepared_by : {
        type  :  mongoose.Schema.ObjectId,
        ref  :  'Restaurant',
        required :  [true, 'bakery name is required'],
        trim  : true
    }
})

ProductSchema.pre(/^find/, function(next) {
    this.populate({
        path : 'created_by',
        select : '-password -__v -role'
    }).populate({
        path :  'prepared_by',
        select :  '-registered_by -__v'
    })

    next();
})

const Product =   mongoose.model('Product', ProductSchema);

module.exports =  Product;