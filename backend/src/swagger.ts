import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Data Center 3D Platform API',
      version: '1.0.0',
      description: 'API documentation for the Data Center 3D Platform',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Sensor: {
          type: 'object',
          required: ['id', 'rack_id', 'type'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the sensor',
            },
            rack_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the rack this sensor belongs to',
            },
            type: {
              type: 'string',
              description: 'Type of sensor (temperature, humidity, voltage, etc.)',
            },
            value: {
              type: 'number',
              description: 'Current sensor reading',
            },
            threshold: {
              type: 'number',
              description: 'Threshold value for alerts',
            },
            alert: {
              type: 'boolean',
              description: 'Whether the sensor is in alert state',
            },
            last_updated: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Zone: {
          type: 'object',
          required: ['id', 'name', 'security_level', 'color', 'position'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            security_level: {
              type: 'string',
              enum: ['public', 'restricted', 'sensitive', 'critical'],
            },
            color: {
              type: 'string',
            },
            position: {
              type: 'object',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Rack: {
          type: 'object',
          required: ['id', 'zone_id', 'name', 'position'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            zone_id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            status: {
              type: 'string',
            },
            temperature: {
              type: 'number',
            },
            power_usage: {
              type: 'number',
            },
            position: {
              type: 'object',
            },
            rotation: {
              type: 'object',
            },
            scale: {
              type: 'object',
            },
          },
        },
        Equipment: {
          type: 'object',
          required: ['id', 'rack_id', 'type', 'model', 'status'],
          properties: {
            id: {
              type: 'string',
            },
            rack_id: {
              type: 'string',
              format: 'uuid',
            },
            type: {
              type: 'string',
            },
            model: {
              type: 'string',
            },
            status: {
              type: 'string',
            },
            vendor: {
              type: 'string',
            },
            serial_number: {
              type: 'string',
            },
            ip_address: {
              type: 'string',
            },
            mac_address: {
              type: 'string',
            },
            position: {
              type: 'object',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Alert: {
          type: 'object',
          required: ['id', 'title', 'severity', 'type', 'status'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
            },
            type: {
              type: 'string',
            },
            source: {
              type: 'string',
            },
            zone_id: {
              type: 'string',
              format: 'uuid',
            },
            equipment_id: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['active', 'acknowledged', 'resolved', 'escalated'],
            },
            acknowledged: {
              type: 'boolean',
            },
            acknowledged_by: {
              type: 'string',
              format: 'uuid',
            },
            acknowledged_at: {
              type: 'string',
              format: 'date-time',
            },
            resolved_at: {
              type: 'string',
              format: 'date-time',
            },
            metadata: {
              type: 'object',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.ts'], // Path to the API routes
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
