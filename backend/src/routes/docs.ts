import express from 'express';
import { swaggerUi, specs } from '../swagger';

const router = express.Router();

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: API Documentation
 *     description: Returns the Swagger UI for API documentation
 *     responses:
 *       200:
 *         description: API documentation page
 */
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(specs, {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  }
}));

export default router;
