"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeMockData = exports.checkDatabaseHealth = exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dc-master';
const POSTGRES_URI = process.env.POSTGRES_URI || 'postgresql://user:password@localhost:5432/dc_master';
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI, {});
        console.log('✅ Connected to MongoDB');
        if (process.env.USE_POSTGRES === 'true') {
            console.log('📝 PostgreSQL connection would be established here');
        }
    }
    catch (error) {
        console.error('❌ Database connection error:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log('✅ Disconnected from database');
    }
    catch (error) {
        console.error('❌ Database disconnection error:', error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
const checkDatabaseHealth = async () => {
    try {
        await mongoose_1.default.connection.db.admin().ping();
        return true;
    }
    catch (error) {
        console.error('❌ Database health check failed:', error);
        return false;
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
const initializeMockData = async () => {
    try {
        console.log('📝 Mock data initialization would happen here');
    }
    catch (error) {
        console.error('❌ Mock data initialization error:', error);
    }
};
exports.initializeMockData = initializeMockData;
//# sourceMappingURL=connection.js.map