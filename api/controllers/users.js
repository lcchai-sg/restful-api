const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.allowedGet = async (req, res, next) => {
    try {
        const result = await User.findOne({ email: req.userData.email });
        if (!result.allowedGet) {
            return res.status(403).json({
                message: 'Unauthorized!'
            })
        }
    } catch(err) {
        console.log('user allowedGet error ', err);
        res.status(500).json({ error: err });
    }
    next();
}

exports.allowedDelete = async (req, res, next) => {
    try {
        const result = await User.findOne({ email: req.userData.email });
        if (!result.allowedDelete) {
            return res.status(403).json({
                message: 'Unauthorized!'
            })
        }
    } catch(err) {
        console.log('user allowedDelete error ', err);
        res.status(500).json({ error: err });
    }
    next();
}

exports.users_sign_up = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(409).json({
                message: 'Email already registered!'
            })
        } else {
            const hash = await bcrypt.hash(req.body.password, 10);
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash,
                allowedGet: req.body.allowedGet,
                allowedDelete: req.body.allowedDelete
            });
            const result = await user.save();
            console.log(result);
            res.status(201).json({
                message: 'User created'
            });
        }
    } catch(err) {
        console.log('user signup error: ', err);
        res.status(500).json({
            error: err
        })
    }
}

exports.users_login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({
                message: 'Auth failed!'
            })
        } else {
            const result = await bcrypt.compare(req.body.password, user.password);
            if (result) {
                const token = await jwt.sign({
                    email: user.email,
                    userId: user._id
                }, process.env.JWT_KEY, {
                    expiresIn: "1h"
                });
                return res.status(200).json({
                    message: 'Auth successful',
                    token: token
                });
            }
            return res.status(401).json({
                message: 'Auth failed!'
            })
        }
    } catch(err) {
        console.log('user login error: ', err);
        res.status(500).json({
            error: err
        })
    }
}

exports.users_get_all = async (req, res) => {
    try {
        const result = await User.find();
        if (result) {
            res.status(200).json({
                count: result.length,
                users: result.map(cur => {
                    return {
                        _id: cur._id,
                        email: cur.email,
                        allowedGet: cur.allowedGet,
                        allowedDelete: cur.allowedDelete
                    }
                })
            })
        }
    } catch(err) {
        console.log('user get all error: ', err);
        res.status(500).json({
            error: err
        })
    }
}

exports.users_delete = async (req, res) => {
    try {
        await User.deleteOne({ _id: req.params.userId });
        res.status(200).json({
            message: 'User deleted'
        })
    } catch(err) {
        console.log('user delete error: ', err);
        res.status(500).json({
            error: err
        })
    }
}