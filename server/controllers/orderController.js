const catchAsync =  require('../utils/catchAsync');
const AppError =  require('../utils/AppError');

const AuthController =  require('./AuthController');
const OrderItem = require('../models/orderModel');
const Product =  require('../models/productModel');


const sendResponse = (data, statusCode,res, msg) =>{
    res.status(statusCode).json({
        status : "success",
        message : msg,
        data : {
            data
        }
    })
}

exports.createOrderItem =  catchAsync( async (req,res,next) => {
    console.log(req.body)
    const order_item = await OrderItem.create({
        order_items : req.body.order_items,
        ordered_by : req.user.id,
        createdAt : req.body.createdAt,
        total_cost : req.body.total_cost,
        order_id : req.body.order_id,
        order_status : req.body.order_status,
        driver :  req.body.driver,
        user_location : req.body.user_location
    })

    if(!order_item){
        return next(new AppError("Failed to create order item", 400))
    }

    sendResponse(order_item, 201, res, "order item created successfully")

})

exports.getAllOrders = catchAsync(async (req,res, next) => {
    const  order_items = await OrderItem.find({order_status : "confirmed" || "accepted" || "delivered"});

    if(!order_items){
        return next(new AppError("No data found in this document", 404))
    }

    sendResponse(order_items, 200, res, "order items found")
})

exports.getMyOrders = catchAsync( async (req,res, next) => {
    const my_orders = await OrderItem.find({ordered_by : req.user.id})

    
    if(!my_orders){
        return  next(new AppError("No order item found with that ID", 404))
    }
    
    sendResponse(my_orders, 200, res, "order items found")
})

exports.deleteOrderItem = catchAsync(async  (req,res, next) => {
    const order_item = await OrderItem.findByIdAndDelete(req.params.id);
    
    if(!order_item){
        return next(new AppError('No document found with that ID', 404))
    }

    sendResponse(order_item, 204, res, "order item deleted succesfully")
})

exports.deleteOrderItems =   catchAsync ( async  (req,res, next) =>  {
    const order_items =  await   OrderItem.deleteMany({});

    if(!order_items) {
        return next(new AppError("No document found with that ID", 404))
    }

    sendResponse(order_items, 203, res, "order items deleted succesfully")
})



exports.updateOrderStatus = catchAsync( async (req,res,next) => {
        const current_order =  await OrderItem.findByIdAndUpdate(req.params.id, {
            order_status : req.body.order_status
        },
        {
            new : true,
            runValidators : true
        }
        )

        if(!current_order){
            return next(new AppError("No data found with that ID", 404))
        }
    
        sendResponse(current_order, 201, res, "Order status updated succesfully")
})