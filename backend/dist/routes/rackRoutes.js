"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rackService_1 = require("../services/rackService");
const router = (0, express_1.Router)();
router.get('/racks', async (_req, res) => {
    try {
        const racks = await rackService_1.RackService.getAllRacks();
        return res.json(racks);
    }
    catch {
        return res.status(500).json({ error: 'Failed to fetch racks' });
    }
});
router.post('/racks', async (req, res) => {
    try {
        const rack = await rackService_1.RackService.createRack(req.body);
        return res.status(201).json(rack);
    }
    catch {
        return res.status(500).json({ error: 'Failed to create rack' });
    }
});
exports.default = router;
//# sourceMappingURL=rackRoutes.js.map