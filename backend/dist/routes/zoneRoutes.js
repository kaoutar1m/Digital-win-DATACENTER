"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zoneService_1 = require("../services/zoneService");
const router = (0, express_1.Router)();
router.get('/zones', async (_req, res) => {
    try {
        const zones = await zoneService_1.ZoneService.getAllZones();
        return res.json(zones);
    }
    catch {
        return res.status(500).json({ error: 'Failed to fetch zones' });
    }
});
router.post('/zones', async (req, res) => {
    try {
        const zone = await zoneService_1.ZoneService.createZone(req.body);
        return res.status(201).json(zone);
    }
    catch {
        return res.status(500).json({ error: 'Failed to create zone' });
    }
});
exports.default = router;
//# sourceMappingURL=zoneRoutes.js.map