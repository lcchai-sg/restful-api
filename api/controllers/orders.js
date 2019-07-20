const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

// get all orders
exports.orders_get_all = async (req, res) => {
    try {
        const results = await Order.find()
        .select('_id productId quantity')
        .populate('productId', '_id name price');
        res.status(200).json({
            count: results.length,
            orders: results.map(cur => {
                return {
                    _id: cur._id,
                    product: cur.productId,
                    quantity: cur.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + cur._id
                    }
                };
            })
        });
    } catch(err) {
        console.log('Get orders error: ', err);
        res.status(500).json({ error: err });
    }
}

exports.orders_create = async (req, res) => {
    try {
        // find productId
        const product = await Product.findById(req.body.productId);
        if (!product) {
            return res.status(404).json({
                message: 'Product not found!'
            })
        }

        // productId found
        // create new order
        const order = new Order({
            _id: mongoose.Types.ObjectId(),
            productId: req.body.productId,
            quantity: req.body.quantity
        });

        // save data
        const result = await order.save();
        console.log(result);
        res.status(201).json({
            message: 'Order created successfully',
            createdOrder: {
                _id: result._id,
                productId: result.productId,
                quantity: result.quantity,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + result._id
                }
            }
        });
    } catch(err) {
        console.log('Create order error: ', err);
        res.status(500).json({ error: err });
    }
}

exports.orders_details = async (req, res) => {
    try {
        const result = await Order.findById(req.params.id)
        .select('_id productId quantity')
        .populate('productId', '_id name price');
        if (result) {
            console.log(result);
            res.status(200).json({
                order: {
                    _id: result._id,
                    product: result.productId,
                    quantity: result.quantity,
                    request: {
                        description: 'Get all orders',
                        type: 'GET',
                        url: 'http://localhost:3000/orders/'
                    }
                }
            });
        } else {
            console.log('order not found ', req.params.id);
            res.status(404).json({ message: 'No data found!' });
        }
    } catch(err) {
        console.log('Get order by id error: ', err);
        res.status(500).json({ error: err })
    }
}

exports.orders_update = async (req, res) => {
    try {
        const result = await Order.findById(req.params.id);
        if (!result) {
            return res.status(404).json({
                message: 'Data not found',
                request: {
                    description: 'Get all orders',
                    type: 'GET',
                    url: 'http://localhost:3000/orders/'
                }
            })
        }
        const updateOps = {};
        for (const ops of req.body) {
            updateOps[ops.propName] = ops.value;
        }
        await Order.updateOne({ _id: req.params.id }, { $set: updateOps });
        res.status(200).json({
            message: 'Order updated',
            request: {
                description: 'View updated order',
                type: 'GET',
                url: 'http://localhost:3000/orders/' + req.params.id
            }
        });
    } catch (err) {
        console.log('patch order error: ', err);
        res.status(500).json({ error: err });
    }
}

exports.orders_delete = async (req, res) => {
    try {
        const result = await Order.findById(req.params.id);
        if (!result) {
            return res.status(404).json({
                message: 'Data not found',
                request: {
                    description: 'Get all orders',
                    type: 'GET',
                    url: 'http://localhost:3000/orders/'
                }
            })
        }
        await Order.deleteOne({ _id: req.params.id });
        res.status(200).json({
            message: 'Order deleted successfully',
            request: {
                description: 'Create new Order',
                type: 'POST',
                url: 'http://localhost:3000/orders',
                body: { productId: 'String', quantity: 'Number' }
            }
        });
    } catch(err) {
        console.log('Delete order error: ', err);
        res.status(500).json({ error: err });
    }
}