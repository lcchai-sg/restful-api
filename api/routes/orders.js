const express = require('express');
const router = express.Router();
const checkAuth = require('../auth/check-auth');
const OrdersController = require('../controllers/orders');

router.get('/', checkAuth, OrdersController.orders_get_all);

router.get('/:id', checkAuth, OrdersController.orders_details);

router.post('/', checkAuth, OrdersController.orders_create);

router.patch('/:id', checkAuth, OrdersController.orders_update);

router.delete('/:id', checkAuth, OrdersController.orders_delete);

module.exports = router;