const mongoose =require('mongoose');
const bcrypt = require('bcrypt')
const crypto  = require('crypto')
const validator = require('validator');

const userSchema = mongoose.Schema({
    firstName : { 
        type : String,
        required : [true, 'Please provide your name'],
        trim : true
    },
    lastName : { 
        type : String,
        required : [true, 'Please provide your name'],
        trim : true
    },
    email : {
        type : String,
        required : [true, 'Please provide your email'],
        unique : [true, "Provided email already exist, try another  one"],
        lowercase : true,
        validate : [validator.isEmail, 'Please provide a valid email']
    },
    telephone : {
        type : String,
        required : [true, "please provide your phone number"],
        unique : [true, "phone number already exists"],
        minlength : [10, "Please provide a valid phone number"],
        maxlength : [10, "Please provide a valid phone number"]
    },
    photo : String, 
    role : {
        type: String,
        enum : ['user', 'admin', 'staff'],
        default : 'user'
    },
    password : {
        type : String,
        required : [true, 'Please provide a strong password'],
        minlength : [8, 'password must be atleast 8 characters long'],
        select : false
    },
    confirmPassword : {
        type : String,
        required : [true, 'Strong password is required'],
        minlength : [8, 'password must be atleast 8 characters long'],
        validate: {
            validator : function(el) {
                return el === this.password;
            },
            message : "Password doesn't match"
        }
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
    active : {
        type: Boolean,
        default : true,
        select : false
    }
})

userSchema.pre('save', async function(next){
    const salt = 10;
    //    only works when password is modified 
    if(!this.isModified('password')) return next();

    //    encrypt the password 
    this.password = await bcrypt.hash(this.password, salt);

    // delete the confirm password field 
    this.confirmPassword = undefined;
    next()
})

// userSchema.pre('save', async function(next){
//     const salt = 10;
//     //    only works when password is modified 
//     if(!this.isModified('password')) return next();

//     //    encrypt the password 
//     this.password = await bcrypt.hash(this.password, salt);

//     // delete the confirm password field 
//     this.confirmPassword = undefined;
//     next()
// })



userSchema.pre('save', function(next){
   if(!this.isModified('password') || this.isNew) return next();

   this.passwordChangedAt = Date.now() - 1000;
   next()
}) 

userSchema.pre(/^find/, function(next){
    this.find({active : {$ne : false}})

    next()
})


userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.changesPasswordAfter =  function(JWTTimestamp){
    changedPassword = this.passwordChangedAt;
    if(changedPassword){
        const changedTime = parseInt(changedPassword.getTime()/1000, 10);
        // console.log(changedTime, JWTTimestamp);
        return JWTTimestamp < changedTime
    }
    return false
}

userSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

     this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    //   console.log({resetToken}, this.passwordResetToken)
     this.passwordResetExpires = Date.now() + 10 * 60000;

     return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = {User};