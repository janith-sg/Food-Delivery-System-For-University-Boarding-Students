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

function formatCurrency(value) {
    return `LKR ${toNumber(value).toFixed(2)}`;
}

function getFoodIdentifier(item) {
    return item.foodID || item.FoodID || '-';
}

function getFoodName(item) {
    return item.name || 'Unnamed Food';
}

function getFoodCategory(item) {
    return item.category || 'Uncategorized';
}

function formatGeneratedAt(date = new Date()) {
    return new Intl.DateTimeFormat('en-LK', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function ensureReportSpace(doc, neededHeight) {
    if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
    }
}

function drawBadge(doc, {
    x,
    y,
    label,
    fillColor,
    textColor = '#0F172A',
    width = 28,
    height = 28,
    radius = 8,
    fontSize = 9,
}) {
    doc
        .save()
        .roundedRect(x, y, width, height, radius)
        .fill(fillColor)
        .restore();

    doc
        .font('Helvetica-Bold')
        .fontSize(fontSize)
        .fillColor(textColor)
        .text(label, x, y + 9, {
            width,
            align: 'center',
        });
}

function drawPageHeader(doc, generatedAtText) {
    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;

    doc
        .save()
        .moveTo(left, 34)
        .lineTo(right, 34)
        .lineWidth(1)
        .strokeColor('#E2E8F0')
        .stroke()
        .restore();

    doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#64748B')
        .text('Food Management Report', left, 20);

    doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#94A3B8')
        .text(generatedAtText, right - 170, 20, {
            width: 170,
            align: 'right',
        });

    doc.y = 52;
}

function drawMetricCard(doc, {
    x,
    y,
    width,
    height,
    accentColor,
    tintColor,
    badgeLabel,
    title,
    value,
    subtitle,
}) {
    doc
        .save()
        .roundedRect(x, y, width, height, 16)
        .fillAndStroke('#FFFFFF', '#E2E8F0')
        .restore();

    doc
        .save()
        .roundedRect(x + 1, y + 1, width - 2, 6, 12)
        .fill(accentColor)
        .restore();

    drawBadge(doc, {
        x: x + width - 40,
        y: y + 16,
        label: badgeLabel,
        fillColor: tintColor,
        textColor: accentColor,
    });

    doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#64748B')
        .text(title, x + 16, y + 18, { width: width - 70 });

    doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .fillColor('#0F172A')
        .text(String(value), x + 16, y + 36, { width: width - 76 });

    doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#94A3B8')
        .text(subtitle, x + 16, y + height - 24, { width: width - 32 });
}

function drawSectionTitle(doc, {
    title,
    subtitle,
    badgeLabel,
    accentColor,
    tintColor,
}) {
    ensureReportSpace(doc, subtitle ? 46 : 32);
    const left = doc.page.margins.left;
    const y = doc.y;

    drawBadge(doc, {
        x: left,
        y,
        label: badgeLabel,
        fillColor: tintColor,
        textColor: accentColor,
    });

    doc
        .font('Helvetica-Bold')
        .fontSize(15)
        .fillColor('#0F172A')
        .text(title, left + 40, y + 3);

    if (subtitle) {
        doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#64748B')
            .text(subtitle, left + 40, y + 20, {
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 40,
            });
    }

    doc.y = y + (subtitle ? 42 : 30);
}

function drawTable(doc, {
    columns,
    rows,
    emptyMessage,
    headerFill,
    headerTextColor,
    stripeFill = '#F8FAFC',
}) {
    const left = doc.page.margins.left;
    const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
    const headerHeight = 26;
    const cellPaddingX = 8;
    const cellPaddingY = 7;

    const drawHeader = () => {
        ensureReportSpace(doc, headerHeight + 6);
        const headerY = doc.y;

        doc
            .save()
            .roundedRect(left, headerY, tableWidth, headerHeight, 10)
            .fill(headerFill)
            .restore();

        let currentX = left;
        columns.forEach((column) => {
            doc
                .font('Helvetica-Bold')
                .fontSize(9)
                .fillColor(headerTextColor)
                .text(column.header, currentX + cellPaddingX, headerY + 8, {
                    width: column.width - cellPaddingX * 2,
                    align: column.align || 'left',
                });
            currentX += column.width;
        });

        doc.y = headerY + headerHeight + 4;
    };

    if (!rows.length) {
        ensureReportSpace(doc, 52);
        const emptyY = doc.y;

        doc
            .save()
            .roundedRect(left, emptyY, tableWidth, 44, 12)
            .fillAndStroke('#FFFFFF', '#E2E8F0')
            .restore();

        doc
            .font('Helvetica')
            .fontSize(10)
            .fillColor('#64748B')
            .text(emptyMessage, left + 12, emptyY + 15, {
                width: tableWidth - 24,
                align: 'center',
            });

        doc.y = emptyY + 56;
        return;
    }

    drawHeader();

    rows.forEach((row, rowIndex) => {
        const values = columns.map((column) => String(row[column.key] ?? '-'));
        const rowHeight = Math.max(
            28,
            ...values.map((value, index) => doc.heightOfString(value, {
                width: columns[index].width - cellPaddingX * 2,
                align: columns[index].align || 'left',
            }) + cellPaddingY * 2),
        );

        if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            drawHeader();
        }

        const rowY = doc.y;

        doc
            .save()
            .roundedRect(left, rowY, tableWidth, rowHeight, 10)
            .fill(rowIndex % 2 === 0 ? stripeFill : '#FFFFFF')
            .restore();

        doc
            .save()
            .roundedRect(left, rowY, tableWidth, rowHeight, 10)
            .lineWidth(0.6)
            .strokeColor('#E2E8F0')
            .stroke()
            .restore();

        let currentX = left;
        columns.forEach((column, index) => {
            if (index > 0) {
                doc
                    .save()
                    .moveTo(currentX, rowY + 4)
                    .lineTo(currentX, rowY + rowHeight - 4)
                    .lineWidth(0.4)
                    .strokeColor('#E2E8F0')
                    .stroke()
                    .restore();
            }

            doc
                .font(column.bold ? 'Helvetica-Bold' : 'Helvetica')
                .fontSize(9)
                .fillColor('#0F172A')
                .text(values[index], currentX + cellPaddingX, rowY + cellPaddingY, {
                    width: column.width - cellPaddingX * 2,
                    align: column.align || 'left',
                });

            currentX += column.width;
        });

        doc.y = rowY + rowHeight + 4;
    });
}

function buildCategorySummary(items, lowStockThreshold) {
    const summaryMap = new Map();

    items.forEach((item) => {
        const category = getFoodCategory(item);
        const stockQty = getStockQuantity(item);
        const existing = summaryMap.get(category) || {
            category,
            totalProducts: 0,
            availableProducts: 0,
            lowStockProducts: 0,
            outOfStockProducts: 0,
            totalUnits: 0,
            inventoryValue: 0,
        };

        existing.totalProducts += 1;
        existing.totalUnits += stockQty;
        existing.inventoryValue += stockQty * toNumber(item.price);

        if (stockQty > 0) {
            existing.availableProducts += 1;
        } else {
            existing.outOfStockProducts += 1;
        }

        if (stockQty > 0 && stockQty <= lowStockThreshold) {
            existing.lowStockProducts += 1;
        }

        summaryMap.set(category, existing);
    });

    return Array.from(summaryMap.values()).sort((first, second) => {
        if (second.totalProducts !== first.totalProducts) {
            return second.totalProducts - first.totalProducts;
        }
        return first.category.localeCompare(second.category);
    });
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
        const lowStockThreshold = 5;
        const generatedAtText = formatGeneratedAt(new Date());
        const availableFoods = foodItems
            .filter((item) => getStockQuantity(item) > 0)
            .sort((first, second) => getFoodName(first).localeCompare(getFoodName(second)));
        const lowStockFoods = foodItems
            .filter((item) => {
                const stockQty = getStockQuantity(item);
                return stockQty > 0 && stockQty <= lowStockThreshold;
            })
            .sort((first, second) => getStockQuantity(first) - getStockQuantity(second));
        const outOfStockFoods = foodItems
            .filter((item) => getStockQuantity(item) <= 0)
            .sort((first, second) => getFoodName(first).localeCompare(getFoodName(second)));
        const categorySummary = buildCategorySummary(foodItems, lowStockThreshold);

        const totalProducts = foodItems.length;
        const totalAvailableUnits = availableFoods.reduce((sum, item) => sum + getStockQuantity(item), 0);
        const totalInventoryValue = availableFoods.reduce(
            (sum, item) => sum + getStockQuantity(item) * toNumber(item.price),
            0,
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="food-report-${Date.now()}.pdf"`);

        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        doc.pipe(res);

        doc.on('pageAdded', () => {
            drawPageHeader(doc, generatedAtText);
        });

        drawPageHeader(doc, generatedAtText);

        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const cardGap = 12;
        const cardWidth = (pageWidth - cardGap) / 2;
        const cardHeight = 82;
        const leftColumnX = doc.page.margins.left;
        const rightColumnX = leftColumnX + cardWidth + cardGap;

        doc
            .font('Helvetica-Bold')
            .fontSize(22)
            .fillColor('#0F172A')
            .text('Food Inventory Report', doc.page.margins.left, doc.y)
            .moveDown(0.25)
            .font('Helvetica')
            .fontSize(10)
            .fillColor('#475569')
            .text('Operational summary of inventory availability, stock alerts, and category-level coverage for the food management system.', {
                width: pageWidth,
            });

        drawSectionTitle(doc, {
            title: 'Total Products Overview',
            subtitle: 'Quick view of product counts and current inventory health.',
            badgeLabel: '#',
            accentColor: '#1D4ED8',
            tintColor: '#DBEAFE',
        });

        const cardsStartY = doc.y + 8;

        drawMetricCard(doc, {
            x: leftColumnX,
            y: cardsStartY,
            width: cardWidth,
            height: cardHeight,
            accentColor: '#1D4ED8',
            tintColor: '#DBEAFE',
            badgeLabel: '#',
            title: 'Total Products',
            value: totalProducts,
            subtitle: `${categorySummary.length} active categories tracked`,
        });

        drawMetricCard(doc, {
            x: rightColumnX,
            y: cardsStartY,
            width: cardWidth,
            height: cardHeight,
            accentColor: '#059669',
            tintColor: '#D1FAE5',
            badgeLabel: 'A',
            title: 'Available Inventory',
            value: availableFoods.length,
            subtitle: `${totalAvailableUnits} units ready for service`,
        });

        drawMetricCard(doc, {
            x: leftColumnX,
            y: cardsStartY + cardHeight + cardGap,
            width: cardWidth,
            height: cardHeight,
            accentColor: '#D97706',
            tintColor: '#FEF3C7',
            badgeLabel: '!',
            title: 'Low Stock Alerts',
            value: lowStockFoods.length,
            subtitle: `Threshold set to ${lowStockThreshold} units or fewer`,
        });

        drawMetricCard(doc, {
            x: rightColumnX,
            y: cardsStartY + cardHeight + cardGap,
            width: cardWidth,
            height: cardHeight,
            accentColor: '#DC2626',
            tintColor: '#FEE2E2',
            badgeLabel: '0',
            title: 'Out-of-Stock Items',
            value: outOfStockFoods.length,
            subtitle: `${formatCurrency(totalInventoryValue)} current available stock value`,
        });

        doc.y = cardsStartY + (cardHeight * 2) + cardGap + 22;

        drawSectionTitle(doc, {
            title: `Available Inventory (${availableFoods.length})`,
            subtitle: 'Products currently in stock and ready for ordering.',
            badgeLabel: 'A',
            accentColor: '#059669',
            tintColor: '#D1FAE5',
        });

        drawTable(doc, {
            columns: [
                { key: 'id', header: 'Food ID', width: 62, bold: true },
                { key: 'name', header: 'Product', width: 156, bold: true },
                { key: 'category', header: 'Category', width: 95 },
                { key: 'stock', header: 'Stock', width: 45, align: 'center' },
                { key: 'price', header: 'Price', width: 62, align: 'right' },
                { key: 'status', header: 'Status', width: 75, align: 'center' },
            ],
            rows: availableFoods.map((item) => ({
                id: getFoodIdentifier(item),
                name: getFoodName(item),
                category: getFoodCategory(item),
                stock: getStockQuantity(item),
                price: formatCurrency(item.price),
                status: getStockQuantity(item) <= lowStockThreshold ? 'Low Stock' : 'Available',
            })),
            emptyMessage: 'No available inventory records found.',
            headerFill: '#ECFDF5',
            headerTextColor: '#047857',
            stripeFill: '#F8FAFC',
        });

        drawSectionTitle(doc, {
            title: `Low Stock Alerts (${lowStockFoods.length})`,
            subtitle: `Products with stock levels between 1 and ${lowStockThreshold} units.`,
            badgeLabel: '!',
            accentColor: '#D97706',
            tintColor: '#FEF3C7',
        });

        drawTable(doc, {
            columns: [
                { key: 'id', header: 'Food ID', width: 62, bold: true },
                { key: 'name', header: 'Product', width: 156, bold: true },
                { key: 'category', header: 'Category', width: 95 },
                { key: 'stock', header: 'Stock', width: 45, align: 'center' },
                { key: 'priority', header: 'Priority', width: 62, align: 'center' },
                { key: 'price', header: 'Price', width: 75, align: 'right' },
            ],
            rows: lowStockFoods.map((item) => ({
                id: getFoodIdentifier(item),
                name: getFoodName(item),
                category: getFoodCategory(item),
                stock: getStockQuantity(item),
                priority: getStockQuantity(item) <= 2 ? 'High' : 'Medium',
                price: formatCurrency(item.price),
            })),
            emptyMessage: 'No low-stock alerts at the moment.',
            headerFill: '#FFF7ED',
            headerTextColor: '#C2410C',
            stripeFill: '#FFFBEB',
        });

        drawSectionTitle(doc, {
            title: `Out-of-Stock Items (${outOfStockFoods.length})`,
            subtitle: 'Products that currently need replenishment before they can be served.',
            badgeLabel: '0',
            accentColor: '#DC2626',
            tintColor: '#FEE2E2',
        });

        drawTable(doc, {
            columns: [
                { key: 'id', header: 'Food ID', width: 62, bold: true },
                { key: 'name', header: 'Product', width: 170, bold: true },
                { key: 'category', header: 'Category', width: 105 },
                { key: 'price', header: 'Price', width: 73, align: 'right' },
                { key: 'status', header: 'Status', width: 85, align: 'center' },
            ],
            rows: outOfStockFoods.map((item) => ({
                id: getFoodIdentifier(item),
                name: getFoodName(item),
                category: getFoodCategory(item),
                price: formatCurrency(item.price),
                status: 'Restock Needed',
            })),
            emptyMessage: 'No out-of-stock items found.',
            headerFill: '#FEF2F2',
            headerTextColor: '#B91C1C',
            stripeFill: '#FFF7F7',
        });

        drawSectionTitle(doc, {
            title: 'Category-Wise Summary',
            subtitle: 'Breakdown of product distribution, stock health, and inventory value by category.',
            badgeLabel: 'C',
            accentColor: '#7C3AED',
            tintColor: '#EDE9FE',
        });

        drawTable(doc, {
            columns: [
                { key: 'category', header: 'Category', width: 110, bold: true },
                { key: 'totalProducts', header: 'Products', width: 55, align: 'center' },
                { key: 'availableProducts', header: 'Available', width: 55, align: 'center' },
                { key: 'lowStockProducts', header: 'Low', width: 55, align: 'center' },
                { key: 'outOfStockProducts', header: 'Out', width: 60, align: 'center' },
                { key: 'totalUnits', header: 'Units', width: 65, align: 'center' },
                { key: 'inventoryValue', header: 'Inventory Value', width: 95, align: 'right' },
            ],
            rows: categorySummary.map((entry) => ({
                category: entry.category,
                totalProducts: entry.totalProducts,
                availableProducts: entry.availableProducts,
                lowStockProducts: entry.lowStockProducts,
                outOfStockProducts: entry.outOfStockProducts,
                totalUnits: entry.totalUnits,
                inventoryValue: formatCurrency(entry.inventoryValue),
            })),
            emptyMessage: 'No category summary data found.',
            headerFill: '#F5F3FF',
            headerTextColor: '#6D28D9',
            stripeFill: '#FAF5FF',
        });

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
