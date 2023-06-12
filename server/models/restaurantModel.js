const mongoose =   require('mongoose');

const RestaurantSchema =  mongoose.Schema({
    restaurantName  : {
        type : String,
        required :  [true, "Restaurant  name is required"],
        trim:  true
    },
    location : {
        type : String,
        // required : [true, "Restaurant locstion is required"],
        trim :  true
    },
    photo :  String,
    description : String,
    contacts : {
        type : String,
        required : [true, "Restaurant contact is required"],
        trim : true
    },
    email : {
        type : String,
        trim  : true
    },
    address : {
        type : Object
    },
    registered_by  : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : [true, "User id is required"],
        trim : true
    } ,
    date_registered : {
        type : Date,
        default : Date.now()
    }

})

RestaurantSchema.pre(/^find/ ,  function(next){
    this.populate({
        path :  'registered_by',
        select :  '-password  -__v -role'
    })

    next();
})

const Restaurant =  mongoose.model('Restaurant', RestaurantSchema);

module.exports =  Restaurant;
