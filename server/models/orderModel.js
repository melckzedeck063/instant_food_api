const  mongoose =  require('mongoose');

const OrderSchema =  mongoose.Schema({
    total_cost : {
        type : String,
        required : [true, "total cost  of the order is required"],
        trim : true
    },
    order_id : {
        type : String,
        default : Date.now()
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    order_status : {
        type : String,
        default : "Pending"
    },
    delivery_fee : String,
    user_location : {
        type : Object,
        required : true
    },
    driver : {
        type : mongoose.Schema.ObjectId,
        ref :'User'
    },
    amounts :[
{
type :Number
}
],
    order_items : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'Product'
        }
    ],
    ordered_by : {
        type : mongoose.Schema.ObjectId,
        ref : 'User'
    }
})

OrderSchema.pre(/^find/, function(next){
    this.populate({
        path : 'ordered_by',
        select : '-__v -role -password'
    })
    .populate({
        path : 'driver',
        select : '-__v -role -password'
    })
    .populate({
        path  :  'order_items',
        select : '-created_by -date_registered -__v'
    })

    next();
})

const OrderItem =  mongoose.model('OrderItem', OrderSchema);

module.exports = OrderItem