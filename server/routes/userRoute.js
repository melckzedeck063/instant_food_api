const express =  require('express');

const router =  express.Router();

const  authController  =   require('../controllers/AuthController');
const  userController =  require('../controllers/userController');

router.post('/signup', authController.signUp);
router.post('/login', authController.Login);

router.use(authController.protect);

router.get('/all_users', userController.getAllUsers);
router.get('/me', userController.getMe);
router.get('/user/:id', userController.getUser);
router.patch('/become_driver', userController.becomeDriver)
router.delete('/delete_user/:id', userController.deleteUser);


module.exports =  router;