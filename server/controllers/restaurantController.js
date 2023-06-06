const  catchAsync  =   require('../utils/catchAsync');
const AppError =   require('../utils/AppError');

const Factory  =  require('../controllers/factoryController');
const Restaurant =   require('../models/restaurantModel')

exports.registeRestaurant = catchAsync(async (req,res,next) => {
    if(!req.body.registered_by) req.body.registered_by = req.user.id
    const new_restaurant  = await Restaurant.create(req.body);

    if(!new_restaurant){
        return next(new AppError('Failed to register new laundry', 400))
    }

    res.status(201).json({
        status : 'success',
        message : "New restaurant  registered succesfully",
        data : {
            new_restaurant
        }
    })
})

exports.getAllRestaurants = Factory.getAll(Restaurant);

exports.getRestaurantById =   Factory.getOne(Restaurant);

exports.updateRestaurant = Factory.updateOne(Restaurant);

exports.deleteRestaurant = Factory.deleteModel(Restaurant);