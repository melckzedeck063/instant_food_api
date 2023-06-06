const express =  require('express');

const AuthController = require('../controllers/AuthController');
const ProductController  =  require('../controllers/productController');
const fileController =  require('../controllers/fileController')


const router  =   express.Router();

router.use(AuthController.protect);

router.post('/new_product', fileController.uploadImage , ProductController.registerProduct);
router.get('/all_products', ProductController.getAllProduct);
router.get('/product/:id', ProductController.getProductById);
router.get('/restaurant_products/:id', ProductController.getRestaurantProduct)

router.patch('/product/:id', ProductController.updateProduct)
router.delete('/delete/:id', ProductController.deleteProduct)

module.exports =  router;
