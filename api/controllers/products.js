const Product = require('../models/product');
const mongoose = require('mongoose');

exports.getProduct = async (req, res, next) => {
    let result;
    try {
        result = await Product.findById(req.params.id)
        .select('_id name price productImage');
        if (!result) {
            console.log('product not found ', req.params.id);
            return res.status(404).json({ message: 'No data found!' })
        }
    } catch (err) {
        console.log('getProduct error: ', err);
        res.status(500).json({ error: err });
    }
    res.product = result;
    next();
}

exports.products_get_all = async (req, res) => {
    try {
        const products = await Product.find()
            .select('_id name price productImage');
        res.status(200).json({
            count: products.length,
            products: products.map(prod => {
                return {
                    _id: prod._id,
                    name: prod.name,
                    price: prod.price,
                    productImage: prod.productImage,
                    request: {
                        description: 'View product details',
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + prod._id
                    }
                }
            })
        });
    } catch(err) {
        console.log('Get all products error: ', err);
        res.status(500).json({ error: err });
    }
}

exports.products_create = async (req, res) => {
    try {
        const product = new Product({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            price: req.body.price,
            productImage: req.file.path
        });
        const result = await product.save();
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                _id: result._id,
                name: result.name,
                price: result.price,
                productImage: result.productImage,
                request: {
                    description: 'View product details',
                    type: 'GET',
                    url: 'http://localhost:3000/products/' + result._id
                }
            }
        })
    } catch (err) {
        console.log('Create product error: ', err);
        res.status(500).json({ error: err });
    }
}

exports.products_details = async (req, res) => {
    res.status(200).json({
        product: {
            _id: res.product._id,
            name: res.product.name,
            price: res.product.price,
            productImage: res.product.productImage,
            request: {
                description: 'Get all products',
                type: 'GET',
                url: 'http://localhost:3000/products/'
            }
        }
    });
}

exports.products_update = async (req, res) => {
    try {
        const updateOps = {};
        for (const ops of req.body) {
            updateOps[ops.propName] = ops.value;
        }
        await Product.updateOne({ _id: req.params.id }, { $set: updateOps });
        res.status(200).json({
            message: 'Product updated',
            request: {
                description: 'View updated product',
                type: 'GET',
                url: 'http://localhost:3000/products/' + req.params.id
            }
        });
    } catch(err) {
        console.log('update product error: ', err);
        res.status(500).json({ error: err });
    }
}

exports.products_delete = async (req, res) => {
    try {
        await Product.deleteOne({ _id: req.params.id })
        res.status(200).json({
            message: 'Product deleted successfully',
            request: {
                description: 'Create new product',
                type: 'POST',
                url: 'http://localhost:3000/products',
                body: { name: 'String', price: 'Number' }
            }
        });
    } catch(err) {
        console.log('delete product error: ', err);
        res.status(500).json({ error: err });
    }
}