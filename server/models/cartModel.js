const mongoose =  require('mongoose');

const  CartSchema =  mongoose.Schema({
    amount : {
        type : Number,
        required :  [true, "amount of cart product is required"],
        trim : true
    },
    total_cost : {
        type : String,
        required : [true, "total cost of the product is required"]
    },
    data_created : {
        type : Date,
        default : Date.now()
    },
    cart_user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : [true, "cart username is required"],
        trim : true
    },
    product : {
        type : mongoose.Schema.ObjectId,
        ref : 'Product',
        required : [true, "Product  id is required"],
        trim : true
    }
})

CartSchema.pre(/^find/, function(next) {
    this.populate({
        path : 'cart_user',
        select : ' -password -role -__v '
    }).populate({
        path : 'product',
        select : '-__v -created_by'
    })

    next();
})


const CartItem = mongoose.model('CartItem', CartSchema);

module.exports =  CartItem;