const catchAsync =  require('../utils/catchAsync');
const AppError =   require('../utils/AppError');

const {User}=  require('../models/userModel');
const Factory =   require('../controllers/factoryController');

const vehicleNumbers = [
    "234CAB","123BAC","567DAP","987BXZ","675DCH","324DRA"
];

const licenseNumbers =[
    "T-45676","T-03456","T-12056","T-32870","T-65432","T-32478"
]

const sendResponse =  (data, message, res, statusCode)  => {
    res.status(statusCode).json({
        status  :  "successfull",
        message :  message,
        data : {
            data
        }
    })
}

exports.getAllUsers = catchAsync( async (req, res, next)  =>  {
    const all_users = await User.find();

    if(!all_users){
        return next(new AppError("No data found in  this document", 400))
    }

    sendResponse(all_users, "data found", res, 200)


})

exports.getDrivers = catchAsync(async (req,res,next) =>  {
    const drivers =  await User.find({role : 'driver'});

    if(!drivers){
        return next(new AppError("No drivers found in this  document", 404))
    }

    sendResponse(drivers, "drivers available are", res,200)
})

exports.getUser = catchAsync( async (req, res, next) => {
    console.log(req.params)
    const user =  await User.findById(req.params.id);

    if(!user ) {
        return next(new AppError("No data found with that id", 404))
    }

    sendResponse(user, "data found", res, 200);
})


exports.getMe = catchAsync ( async (req,res,next) => {
    console.log(req.user.id)
    const logedUser = await User.findById(req.user.id);

    if(!logedUser) {
        return next(new AppError("No user found with that ID", 404))
    }

    sendResponse(logedUser, "user found", res, 200)
})

exports.becomeDriver = catchAsync( async (req,res, next) => {
    const vehicleNumber =   req.body.vehicleNo
    const licenseNumber = req.body.licenseNo
    if (vehicleNumbers.includes(vehicleNumber) && licenseNumbers.includes(licenseNumber)) {
        
        const current_user  = await User.findByIdAndUpdate(req.user.id, {
            vehicleNo : vehicleNumber,
            licenseNo : licenseNumber,
            station  : req.body.station,
            role : "driver" 
        },
        {
            new : true,
            runValidators : true
        } 
        )

        if(!current_user){
            return next(new  AppError('No user found with that ID', 404))
        }

        sendResponse(current_user, "User role updated succesfully",res, 201)
      }
      else {
        return next(new AppError('The entered vehicle  or license number does not exist', 400))
      }
})

exports.updateLocation = catchAsync( async(req,res,next)  => {
    const current_user = await User.findByIdAndUpdate(req.user.id, {
        live_location :  req.body.latlong
    }, {
        new : true,
        runValidators : true
    }
    )
    if(!current_user){
        return next(new  AppError('No user found with that ID', 404))
    }

    sendResponse(current_user, "User location updated succesfully",res, 201);
})

exports.deleteUser = Factory.deleteModel(User);
exports.deactivateAccount =   Factory.deactivateOne(User);