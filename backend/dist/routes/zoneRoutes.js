"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zoneService_1 = require("../services/zoneService");
const metricService_1 = require("../services/metricService");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        const zones = await zoneService_1.ZoneService.getAllZones();
        return res.json(zones);
    }
    catch {
        return res.status(500).json({ error: 'Failed to fetch zones' });
    }
});
router.get('/:zoneId/metrics', async (req, res) => {
    try {
        const { zoneId } = req.params;
        const zone = await zoneService_1.ZoneService.getZoneById(zoneId);
        if (!zone) {
            return res.status(404).json({ error: 'Zone not found' });
        }
        const metrics = await metricService_1.MetricService.getZoneMetrics(zoneId);
        const aggregatedMetrics = {
            temperature: metrics.temperature?.avg_value || 24,
            powerUsage: metrics.power_consumption?.avg_value || 150,
            rackCount: metrics.rack_count || 20,
            status: metrics.status || 'Normal',
            cpu: metrics.cpu?.avg_value || 45,
            memory: metrics.memory?.avg_value || 62,
            traffic: metrics.network_traffic?.avg_value || 30,
            humidity: metrics.humidity?.avg_value || 45,
            airFlow: metrics.air_flow?.avg_value || 1200,
            lastUpdate: new Date(),
        };
        return res.json(aggregatedMetrics);
    }
    catch (error) {
        console.error('Error fetching zone metrics:', error);
        return res.status(500).json({ error: 'Failed to fetch zone metrics' });
    }
});
router.post('/', async (req, res) => {
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