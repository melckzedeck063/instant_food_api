const express =  require('express');

const router =  express.Router();

const AuthController =  require('../controllers/AuthController');
const OrderController =  require('../controllers/orderController');

router.use(AuthController.protect);

router.post('/create_order', OrderController.createOrderItem);
router.get('/my_orders', OrderController.getMyOrders);
router.get('/driver_orders', OrderController.getSentOrders)

router.delete('/delete_orders',OrderController.deleteOrderItems )
router.delete('/delete_order/:id', OrderController.deleteOrderItem);
router.put('/update_order/:id', OrderController.updateOrderStatus);

router.use(AuthController.restrictTo('admin'));
router.get('/all_orders', OrderController.getAllOrders);

module.exports = router;