const  express =  require('express');

const  router =    express.Router();

const CartController  =  require('../controllers/cartItemController');
const AuthController  =   require('../controllers/AuthController')

router.use(AuthController.protect);

router.post('/new_item', CartController.createCartItem);
router.get('/all_items', CartController.getCartItems);
router.patch('/update_cart/:id', CartController.updateCartItem)
router.delete('/delete_carts', CartController.deleteCartItmes);
router.delete('/delete_cart/:id', CartController.deleteCartItem);


module.exports  =  router;