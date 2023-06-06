const crypto =  require('crypto');
const {promisify } = require('util')
// const  jwt =  require('jsonwebtoken');
const jwt = require('jsonwebtoken')
const {User} = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/AppError')


const  sendResponse = (statusCode, message, res, data) => {
    
    res.status(statusCode).json({
        status : 'success',
        message  :  message,
        doc: data
    })
}

const signToken =  id => {
    return jwt.sign({   id }, process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user, statusCode, res) => {
    const token =  signToken(user.id);

    const cookieOptions = {
        expires : new Date( Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 ),
        httpOnly : true
    }


    if(process.env.NODE_ENV === "production") cookieOptions.secure  = true
    res.cookie('jwt', token, cookieOptions)

    // remove or hide the password  from the database 
    user.password =  undefined;

    res.status(statusCode).json({
        status : 'success',
        token,
        doc :  {
            user
        }
    })
  }

exports.signUp = catchAsync (async (req, res, next) => {
    console.log(req.body)
    const newUser =  await User.create(req.body);

    if(!newUser) {
        return  next( new AppError("User account creation request failed", 400))
    }

    // sendResponse(201, "User  account  created succesfully", res, newUser)
    createSendToken(newUser, 201, res)
    
})


// exports.Login =  catchAsync ( async (req, res, next) =>  {
//     const {username, password} =  req.body ;

//     // check if username and password  exists 
//     if(!username || !password) {
//         console.log("error here  1")
//         return next(  new AppError('Please provide username and password', 400))
//     }

//     const user =   await  User.findOne({username}).select('+password');
//     if(!user || !(await user.correctPassword(password, user.password))){
//         console.log("error here  2")
//         return next(new AppError('Incorrect user login credentials'))
//     }

//     // if  everything  is okay create  and send token 
//     console.log(user);
//     createSendToken(user, 200, res)
// })

exports.Login = catchAsync(async(req,res,next) => {
    const {email, password} = req.body;

    // 1) check if email and password exists 
       if(!email || !password){
           return next(new AppError('Please provide email and password!', 400))
       }
    // 2) check if user exists 
      const user = await User.findOne({email}).select('+password');
      if(!user || ! (await user.correctPassword(password, user.password))) {
          return next(new AppError('Incorrect username or password', 401));
      }
    // 3) if everything is ok send token to client 
    // sendResponse(200,'Successfull  loged in', res, data)
   createSendToken(user, 200, res)
});



exports.protect = catchAsync(async (req,res,next) => {
    let token;
    // 1) get token and check if it exists 
     if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
         token =  req.headers.authorization.split(' ')[2];
     }
     else if(req.cookie.jwt){
         console.log("error 2")
         token = req.cookies.jwt
     }

     if(!token){
         return next(new AppError('You are not loged in! Please log in to get access', 401))
     }
    // 2) verify the token 
    // console.log("error 3")
    // console.log(token)
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET)

    // 3) check if user still exists 
     const freshUser = await User.findById(decoded.id);
     if(!freshUser){
         return next(new AppError('The user belonging to this token does no longer exists.', 401));
     }
    // 4) check if user changed password after token was issued
      if(freshUser.changesPasswordAfter(decoded.iat)){
          return next(new AppError('User recently changed password! Please login again', 401))
      }

      req.user = freshUser;
    next()
})

exports.restrictTo = (...role) => {
  return (req,res,next) => {
      if(!role.includes(req.user.role)){
           next(new AppError('You do not have permission to perfome this action! Please contact your admin', 403))
      }

      next();
  }

};

exports.forgotPassword = catchAsync(async (req,res,next) => {
    // 1) check user based on the provided email 
     const user = await User.findOne({email : req.body.email});
     if(!user) {
         return next(new AppError('There is no user found with that email! Please provide a valid email', 404));
     }
    // 2) generate random reset token 
    
     const resetToken = user.createResetPasswordToken();
     await user.save({validateBeforeSave : false})
      
    // 3) send the generated token to the user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/:${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:  ${resetURL} .\n If you didn't forgot your password! please ignore this message` ;

    try{
    await sendEmail({
        email : user.email,
        subject : 'Your password reset token is valid only for 10 mins',
        message
    })

    res.status(201).json({
        status : 'success',
        message :'Token sent to email'
    })
    } catch(err){
        user.passwordResetToken = undefined,
        user.passwordResetExpires = undefined,
        await user.save({validateBeforeSave : false})
        return next(new AppError('There was an error while sending the email! try again later'), 500)
    }
});

exports.resetPassword =  catchAsync(async(req,res,next) => {
    // 1)get the user based on the token 
        const hashedToken =  crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({passwordResetToken : hashedToken, passwordResetExpires : {$gt : Date.now()}});

        // 2) reset the password if token has not expired 
        if(!user) {
            return next(new AppError('Token is invalid or has expired! try again', 404));
        }

        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        
        await user.save();
        
    // 3) update passwordChangedAt property for the user 
    // 4) log the user in by sending the JWT 
      createSendToken(user, 200, res)
});


exports.updatePassword =  catchAsync(async(req,res,next) => {
    // 1) get the user from collection 

      const user = await User.findById(req.user.id).select('+password');
      // 2) check if the current posted password is correct  then update the password 
      if(!( await user.correctPassword(req.body.passwordCurrent, user.password))) {
          return next(new AppError('Your current password is wrong', 404));
      }
    //   3) if so update the user password 
     user.password = req.body.password;
     user.confirmPassword = req.body.confirmPassword;

     await user.save()

    // 3)  Then Log in the user ,send the JWT

     createSendToken(user, 200, res)
    })