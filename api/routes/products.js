const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../auth/check-auth');
const ProductControllers = require("../controllers/products");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter
});

router.get('/', ProductControllers.products_get_all);

router.get('/:id', ProductControllers.getProduct, ProductControllers.products_details);

router.post('/', checkAuth, upload.single('productImage'), ProductControllers.products_create);

router.patch('/:id', checkAuth, ProductControllers.getProduct,ProductControllers.products_update);

router.delete('/:id', checkAuth, ProductControllers.getProduct,ProductControllers.products_delete);

module.exports = router;