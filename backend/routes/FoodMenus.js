const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

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

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function getStockQuantity(item) {
    const stockText = String(item.stock || '').trim();
    const numeric = Number(stockText);
    if (!Number.isNaN(numeric)) return Math.max(0, numeric);
    if (/out|unavailable|false|sold/i.test(stockText)) return 0;
    return 0;
}

function getSoldQuantity(item) {
    return Math.max(
        0,
        toNumber(item.soldQuantity),
        toNumber(item.ordersCount),
        toNumber(item.salesCount),
    );
}

function resolveImagePath(imageValue) {
    if (!imageValue || typeof imageValue !== 'string') return null;
    const normalized = imageValue.replace(/\\/g, '/').replace(/^\/+/, '');
    if (/^https?:\/\//i.test(normalized)) return null;
    const absolutePath = path.join(__dirname, '..', normalized);
    if (fs.existsSync(absolutePath)) return absolutePath;
    return null;
}

function drawImageOrPlaceholder(doc, imagePath, x, y, width, height) {
    if (imagePath) {
        try {
            doc.image(imagePath, x, y, { fit: [width, height], align: 'center', valign: 'center' });
            return;
        } catch (err) {
            // Fall back to a placeholder if the image cannot be rendered.
        }
    }

    doc
        .save()
        .lineWidth(0.8)
        .strokeColor('#CBD5E1')
        .rect(x, y, width, height)
        .stroke()
        .fontSize(8)
        .fillColor('#64748B')
        .text('No Image', x, y + height / 2 - 4, { width, align: 'center' })
        .restore();
}

function ensurePageSpace(doc, neededHeight) {
    if (doc.y + neededHeight > doc.page.height - 60) {
        doc.addPage();
        doc.fontSize(10).fillColor('#334155');
    }
}

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

router.patch('/:id/rating', async (req, res) => {
    try {
        const stars = Number(req.body?.stars);
        if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
            return res.status(400).json({ msg: 'Rating not saved', error: 'Stars must be an integer between 1 and 5' });
        }

        const food = await FoodMenus.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ msg: 'Food item not found' });
        }

        food.ratingTotal = toNumber(food.ratingTotal) + stars;
        food.ratingCount = toNumber(food.ratingCount) + 1;
        food.ratingAverage = Number((food.ratingTotal / food.ratingCount).toFixed(2));

        await food.save();

        return res.json({
            msg: 'Rating saved successfully',
            ratingAverage: food.ratingAverage,
            ratingCount: food.ratingCount,
        });
    } catch (err) {
        return res.status(400).json({ msg: 'Rating not saved', error: err.message });
    }
});

router.get('/reports/pdf', async (req, res) => {
    try {
        const foodItems = await FoodMenus.find().lean();
        const availableFoods = foodItems.filter((item) => getStockQuantity(item) > 0);
        const sellingFoods = foodItems
            .map((item) => {
                const soldQuantity = getSoldQuantity(item);
                return {
                    ...item,
                    soldQuantity,
                    salesTotal: soldQuantity * toNumber(item.price),
                };
            })
            .filter((item) => item.soldQuantity > 0)
            .sort((a, b) => b.soldQuantity - a.soldQuantity);

        const salesGrandTotal = sellingFoods.reduce((sum, item) => sum + item.salesTotal, 0);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="food-report-${Date.now()}.pdf"`);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        doc.pipe(res);

        doc
            .fontSize(20)
            .fillColor('#0F172A')
            .text('Food Menu Report', { align: 'left' })
            .moveDown(0.3)
            .fontSize(10)
            .fillColor('#475569')
            .text(`Generated: ${new Date().toLocaleString()}`)
            .moveDown(1);

        doc
            .fontSize(15)
            .fillColor('#14532D')
            .text(`Available Foods (${availableFoods.length})`)
            .moveDown(0.5);

        availableFoods.forEach((item, index) => {
            ensurePageSpace(doc, 78);

            const y = doc.y;
            const imageX = 52;
            const imageY = y + 2;
            const imageWidth = 50;
            const imageHeight = 50;
            drawImageOrPlaceholder(doc, resolveImagePath(item.image), imageX, imageY, imageWidth, imageHeight);

            const stockQty = getStockQuantity(item);
            const textX = imageX + imageWidth + 12;
            doc
                .fontSize(11)
                .fillColor('#0F172A')
                .text(`${index + 1}. ${item.name || 'Unnamed Food'}`, textX, y)
                .fontSize(9)
                .fillColor('#334155')
                .text(`ID: ${item.foodID || item.FoodID || '-'}`, textX)
                .text(`Category: ${item.category || '-'}`, textX)
                .text(`Price: LKR ${toNumber(item.price).toFixed(2)} | Quantity: ${stockQty}`, textX);

            doc.moveDown(1.1);
        });

        ensurePageSpace(doc, 60);
        doc
            .moveDown(0.4)
            .fontSize(15)
            .fillColor('#7C2D12')
            .text(`Selling Foods (${sellingFoods.length})`)
            .moveDown(0.5);

        if (sellingFoods.length === 0) {
            doc
                .fontSize(10)
                .fillColor('#64748B')
                .text('No sold food quantity data available yet.')
                .moveDown(1);
        } else {
            sellingFoods.forEach((item, index) => {
                ensurePageSpace(doc, 78);

                const y = doc.y;
                const imageX = 52;
                const imageY = y + 2;
                const imageWidth = 50;
                const imageHeight = 50;
                drawImageOrPlaceholder(doc, resolveImagePath(item.image), imageX, imageY, imageWidth, imageHeight);

                const textX = imageX + imageWidth + 12;
                doc
                    .fontSize(11)
                    .fillColor('#0F172A')
                    .text(`${index + 1}. ${item.name || 'Unnamed Food'}`, textX, y)
                    .fontSize(9)
                    .fillColor('#334155')
                    .text(`Sold Quantity: ${item.soldQuantity}`, textX)
                    .text(`Unit Price: LKR ${toNumber(item.price).toFixed(2)}`, textX)
                    .text(`Total: LKR ${toNumber(item.salesTotal).toFixed(2)}`, textX);

                doc.moveDown(1.1);
            });
        }

        ensurePageSpace(doc, 40);
        doc
            .fontSize(12)
            .fillColor('#0F172A')
            .text(`Grand Total (Selling Foods): LKR ${salesGrandTotal.toFixed(2)}`, { align: 'right' });

        doc.end();
    } catch (err) {
        return res.status(500).json({ msg: 'Could not generate PDF report', error: err.message });
    }
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