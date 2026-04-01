const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const FoodMenus = require('../models/FoodMenu');

const uploadsDirectory = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDirectory)) {
    fs.mkdirSync(uploadsDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDirectory),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '-');
        cb(null, `${Date.now()}-${safeName}`);
    },
});

const imageOnly = (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
        cb(null, true);
        return;
    }
    cb(new Error('Only image files are allowed.'));
};

const upload = multer({ storage, fileFilter: imageOnly });
const MAX_PRICE = 10000;

function buildPayload(req) {
    const normalizedFoodId = req.body.foodID || req.body.FoodID;
    const payload = {
        foodID: normalizedFoodId,
        FoodID: normalizedFoodId,
        name: req.body.name,
        category: req.body.category,
        price: Number(req.body.price),
        stock: req.body.stock,
        type: req.body.type,
        portion: req.body.portion,
    };

    const setIfDefined = (key, value) => {
        if (value !== undefined) {
            payload[key] = value;
        }
    };

    setIfDefined('description', req.body.description);
    setIfDefined('protein', req.body.protein);
    setIfDefined('calories', req.body.calories);
    setIfDefined('ingredients', req.body.ingredients);
    setIfDefined('spiceLevel', req.body.spiceLevel);
    setIfDefined('portionSize', req.body.portionSize);
    setIfDefined('bestBefore', req.body.bestBefore);
    setIfDefined('preparationTime', req.body.preparationTime);
    setIfDefined('dietType', req.body.dietType);
    setIfDefined('servingType', req.body.servingType);

    if (req.file) {
        payload.image = `uploads/${req.file.filename}`;
    } else if (typeof req.body.image === 'string') {
        payload.image = req.body.image;
    }

    return payload;
}

function normalizeFoodId(value = '') {
    return String(value).trim().toUpperCase();
}

async function hasDuplicateFoodId(foodID, excludeId) {
    const normalized = normalizeFoodId(foodID);
    if (!normalized) return false;

    const query = {
        $or: [
            { foodID: normalized },
            { FoodID: normalized },
        ],
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const existing = await FoodMenus.findOne(query).select('_id').lean();
    return Boolean(existing);
}

router.get('/test', (req, res) => res.send("Food Menu route is working"));

router.post('/', upload.single('image'), async (req, res) => {
    try {
        const payload = buildPayload(req);
        payload.foodID = normalizeFoodId(payload.foodID);
        payload.FoodID = payload.foodID;

        if (Number.isNaN(payload.price) || payload.price <= 0) {
            return res.status(400).json({ msg: 'Food Menu not added', error: 'Price must be a valid amount greater than 0' });
        }

        if (payload.price > MAX_PRICE) {
            return res.status(400).json({ msg: 'Food Menu not added', error: 'Price cannot be more than Rs10000.00' });
        }

        if (!payload.foodID) {
            return res.status(400).json({ msg: 'Food Menu not added', error: 'Food ID is required' });
        }

        const duplicate = await hasDuplicateFoodId(payload.foodID);
        if (duplicate) {
            return res.status(409).json({ msg: 'Food Menu not added', error: `Food ID ${payload.foodID} already exists` });
        }

        await FoodMenus.create(payload);
        return res.json({msg: "Food Menu added successfully"});
    } catch (err) {
        return res.status(400).json({msg:"Food Menu not added", error: err.message});
    }
});

router.get('/', (req, res) => {
    FoodMenus.find()
    .then(foodMenus => res.json(foodMenus))
    .catch(err => res.status(400).json({msg:"Error No food menus found", error: err.message}));
});

router.get('/:id', (req, res) => {
    FoodMenus.findById(req.params.id)
    .then(foodMenu => res.json(foodMenu))
    .catch(err => res.status(400).json({msg:"Error No food menu found", error: err.message}));
});

router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const existing = await FoodMenus.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ msg: "Food Menu not found" });
        }

        const payload = buildPayload(req);
        payload.foodID = normalizeFoodId(payload.foodID);
        payload.FoodID = payload.foodID;

        if (Number.isNaN(payload.price) || payload.price <= 0) {
            return res.status(400).json({ msg: "Food Menu not updated", error: "Price must be a valid amount greater than 0" });
        }

        if (payload.price > MAX_PRICE) {
            return res.status(400).json({ msg: "Food Menu not updated", error: "Price cannot be more than Rs10000.00" });
        }

        if (!payload.foodID) {
            return res.status(400).json({ msg: "Food Menu not updated", error: "Food ID is required" });
        }

        const duplicate = await hasDuplicateFoodId(payload.foodID, req.params.id);
        if (duplicate) {
            return res.status(409).json({ msg: "Food Menu not updated", error: `Food ID ${payload.foodID} already exists` });
        }

        if (!req.file && payload.image === undefined) {
            payload.image = existing.image || "";
        }

        await FoodMenus.findByIdAndUpdate(req.params.id, payload, { runValidators: true });
        return res.json({msg: "Food Menu updated successfully"});
    } catch (err) {
        return res.status(400).json({msg:"Food Menu not updated", error: err.message});
    }
});

router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message === 'Only image files are allowed.') {
        return res.status(400).json({ msg: 'Image upload failed', error: err.message });
    }
    return next(err);
});

router.delete('/:id', (req, res) => {
    FoodMenus.findByIdAndDelete(req.params.id)
    .then(() => res.json({msg: "Food Menu deleted successfully"}))
    .catch(err => res.status(400).json({msg:"Food Menu deleted failed", error: err.message}));
});

module.exports = router;