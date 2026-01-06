"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rackService_1 = require("../services/rackService");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        const racks = await rackService_1.RackService.getAllRacks();
        return res.json(racks);
    }
    catch {
        return res.status(500).json({ error: 'Failed to fetch racks' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const rack = await rackService_1.RackService.getRackById(req.params.id);
        if (!rack) {
            return res.status(404).json({ error: 'Rack not found' });
        }
        return res.json(rack);
    }
    catch {
        return res.status(500).json({ error: 'Failed to fetch rack' });
    }
});
router.post('/', async (req, res) => {
    try {
        const rack = await rackService_1.RackService.createRack(req.body);
        return res.status(201).json(rack);
    }
    catch {
        return res.status(500).json({ error: 'Failed to create rack' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const rack = await rackService_1.RackService.updateRack(req.params.id, req.body);
        if (!rack) {
            return res.status(404).json({ error: 'Rack not found' });
        }
        return res.json(rack);
    }
    catch {
        return res.status(500).json({ error: 'Failed to update rack' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await rackService_1.RackService.deleteRack(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Rack not found' });
        }
        return res.json({ message: 'Rack deleted successfully' });
    }
    catch {
        return res.status(500).json({ error: 'Failed to delete rack' });
    }
});
router.get('/:id/layout', async (req, res) => {
    try {
        const layout = await rackService_1.RackService.getRackLayout(req.params.id);
        return res.json(layout);
    }
    catch (error) {
        console.error('Error fetching rack layout:', error);
        return res.status(500).json({ error: 'Failed to fetch rack layout' });
    }
});
router.put('/:rackId/equipment/:equipmentId/position', async (req, res) => {
    try {
        const { position_u } = req.body;
        const success = await rackService_1.RackService.updateEquipmentPosition(req.params.rackId, req.params.equipmentId, position_u);
        return res.json({ success });
    }
    catch (error) {
        console.error('Error updating equipment position:', error);
        return res.status(500).json({ error: error.message || 'Failed to update equipment position' });
    }
});
router.post('/:rackId/equipment/:equipmentId/move', async (req, res) => {
    try {
        const { position_u } = req.body;
        const success = await rackService_1.RackService.moveEquipmentToRack(req.params.equipmentId, req.params.rackId, position_u);
        return res.json({ success });
    }
    catch (error) {
        console.error('Error moving equipment:', error);
        return res.status(500).json({ error: error.message || 'Failed to move equipment' });
    }
});
router.get('/:id/utilization', async (req, res) => {
    try {
        const utilization = await rackService_1.RackService.getRackUtilization(req.params.id);
        return res.json(utilization);
    }
    catch (error) {
        console.error('Error fetching rack utilization:', error);
        return res.status(500).json({ error: 'Failed to fetch rack utilization' });
    }
});
router.get('/:id/validate', async (req, res) => {
    try {
        const validation = await rackService_1.RackService.validateRackCapacity(req.params.id);
        return res.json(validation);
    }
    catch (error) {
        console.error('Error validating rack capacity:', error);
        return res.status(500).json({ error: 'Failed to validate rack capacity' });
    }
});
exports.default = router;
//# sourceMappingURL=rackRoutes.js.map