# Equipment Display Fix Plan

## Problem
The EquipmentManagement component is not displaying any equipment. The issue is that:
- Equipment service uses in-memory mock data (only 2 items)
- Database schema doesn't include equipment tables
- initDb script doesn't insert equipment data
- Frontend fetches from API but gets empty results

## Solution Steps

### 1. Update Database Schema
- [ ] Add equipment table to `database/init.sql`
- [ ] Add equipment_metrics table to `database/init.sql`

### 2. Update Database Initialization
- [ ] Add equipment sample data insertion to `backend/src/scripts/initDb.ts`
- [ ] Ensure proper foreign key relationships with racks

### 3. Update Equipment Service
- [ ] Modify `backend/src/services/equipmentService.ts` to use database instead of mock data
- [ ] Implement proper database queries for CRUD operations

### 4. Test and Verify
- [ ] Reinitialize database with new schema
- [ ] Verify equipment data is inserted correctly
- [ ] Test API endpoints return equipment data
- [ ] Verify frontend displays equipment properly

## Files to Modify
- `database/init.sql` - Add equipment tables
- `backend/src/scripts/initDb.ts` - Add equipment sample data
- `backend/src/services/equipmentService.ts` - Switch from mock to database

## Expected Result
EquipmentManagement component should display 10+ equipment items with proper details, filtering, and status indicators.
