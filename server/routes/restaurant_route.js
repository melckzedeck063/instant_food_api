const express  =  require('express');

const router =  express.Router();

const AuthController =  require('../controllers/AuthController');
const RestaurantController =  require('../controllers/restaurantController');
const fileController =  require('../controllers/fileController')

router.use(AuthController.protect);

router.get('/restaurants', RestaurantController.getAllRestaurants);
router.get('/restaurant/:id', RestaurantController.getRestaurantById);

router.use(AuthController.restrictTo('admin'));

router.patch('/update_restaurant/:id', RestaurantController.updateRestaurant);
router.post('/new_restaurant', fileController.uploadImage ,RestaurantController.registeRestaurant);
router.delete('/delete_restaurant/:id', RestaurantController.deleteRestaurant);

module.exports = router;