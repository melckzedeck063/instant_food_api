const CartItem  =  require('../models/cartModel');

const catchAsync   =  require('../utils/catchAsync');
const  AppError =  require('../utils/AppError');
const Factory =   require('../controllers/factoryController')


const  sendResponse = (data, statusCode, res, message) => {
    res.status(statusCode).json({
        status : "success",
        message : message,
        results : data.length,
        data : {
            data
        }
    })
}

exports.createCartItem  =    catchAsync( async(req,res, next) => {
    const newItem =  await CartItem.create({
        amount :  req.body.amount,
        total_cost :  req.body.total_cost,
        date_created  :  req.body.date_created,
        cart_user  :  req.user.id,
        product  :  req.body.product
    }) 


    if(!newItem) {
        return  next ( new AppError("Failed  to create new cart item", 400))
    }

    sendResponse(newItem, 201, res, "New cart item added successfully")

} )

exports.getCartItems  =  catchAsync(  async (req,res, next) => {
    const  cartItems =   await   CartItem.find({cart_user : req.user.id});

    if(!cartItems) {
        return  next(new AppError("No document found  in this  collection", 404))
    }

    sendResponse(cartItems, 200, res, "Cart items  found  succesfully")
})

exports.updateCartItem =  catchAsync( async (req,res,next) => {
    console.log(req.body)
    const cartItem =  await CartItem.findByIdAndUpdate(req.params.id, {
        amount :  req.body.amount,
        total_cost : req.body.total_cost
    }, 
    {
        new : true,
        runValidators : true
    }
    )

    if(!cartItem){
        return  next(new AppError('No document found with that ID', 404))
    }

    sendResponse(cartItem, 202, res, "Cart item updated succesfully")
})

exports.deleteCartItmes = catchAsync ( async (req,res,next)  => {
    const cart_items = await   CartItem.deleteMany({cart_user : req.user.id});

    if(!cart_items){
        return  next(new AppError('No documents  found with that ID', 404));
    }

    sendResponse(cart_items, 203, res, 'cart items succesfully deleted');
})

exports.deleteCartItem =  Factory.deleteModel(CartItem)