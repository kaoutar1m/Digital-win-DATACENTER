import pool from './database';
import { AlertRule } from '../models/Alert';

export class AlertRuleService {
  // Create a new alert rule
  static async createRule(ruleData: Omit<AlertRule, 'id' | 'created_at' | 'updated_at'>): Promise<AlertRule> {
    const { name, description, condition, severity, action, is_active = true } = ruleData;

    const result = await pool.query(
      `INSERT INTO alert_rules (name, description, condition, severity, action, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, condition, severity, action, is_active]
    );

    return result.rows[0];
  }

  // Get all active rules
  static async getActiveRules(): Promise<AlertRule[]> {
    const result = await pool.query(
      `SELECT * FROM alert_rules WHERE is_active = true ORDER BY created_at DESC`
    );

    return result.rows;
  }

  // Get all rules with pagination
  static async getRules(limit: number = 50, offset: number = 0): Promise<AlertRule[]> {
    const result = await pool.query(
      `SELECT * FROM alert_rules ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  }

  // Get rule by ID
  static async getRuleById(id: string): Promise<AlertRule | null> {
    const result = await pool.query('SELECT * FROM alert_rules WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Update rule
  static async updateRule(id: string, updates: Partial<AlertRule>): Promise<AlertRule | null> {
    const fields = [];
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = $${i++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);

    const result = await pool.query(
      `UPDATE alert_rules SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Delete rule
  static async deleteRule(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM alert_rules WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  // Toggle rule active status
  static async toggleRule(id: string): Promise<AlertRule | null> {
    const result = await pool.query(
      `UPDATE alert_rules SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    return result.rows[0] || null;
  }

  // Evaluate rule condition against data
  static evaluateCondition(condition: any, data: any): boolean {
    try {
      // Simple condition evaluation - can be extended for complex rules
      if (typeof condition === 'object' && condition.operator) {
        const { field, operator, value } = condition;

        const fieldValue = data[field];
        if (fieldValue === undefined) return false;

        switch (operator) {
          case 'eq': return fieldValue === value;
          case 'neq': return fieldValue !== value;
          case 'gt': return fieldValue > value;
          case 'gte': return fieldValue >= value;
          case 'lt': return fieldValue < value;
          case 'lte': return fieldValue <= value;
          case 'contains': return String(fieldValue).includes(String(value));
          case 'in': return Array.isArray(value) && value.includes(fieldValue);
          default: return false;
        }
      }

      // For complex conditions with AND/OR
      if (condition.and) {
        return condition.and.every((subCondition: any) => this.evaluateCondition(subCondition, data));
      }

      if (condition.or) {
        return condition.or.some((subCondition: any) => this.evaluateCondition(subCondition, data));
      }

      return false;
    } catch (error) {
      console.error('Error evaluating rule condition:', error);
      return false;
    }
  }

  // Execute rule action
  static async executeAction(action: any, alertData: any): Promise<void> {
    try {
      if (action.type === 'create_alert') {
        const { AlertService } = await import('./alertService');
        await AlertService.createAlert(action.alert);
      }

      if (action.type === 'send_notification') {
        const { AlertNotificationService } = await import('./alertNotificationService');
        await AlertNotificationService.createNotification(action.notification);
      }

      if (action.type === 'webhook') {
        // Implement webhook call
        await this.callWebhook(action.webhook, alertData);
      }

      if (action.type === 'email') {
        // Implement email sending
        await this.sendEmail(action.email, alertData);
      }

      if (action.type === 'sms') {
        // Implement SMS sending
        await this.sendSMS(action.sms, alertData);
      }
    } catch (error) {
      console.error('Error executing rule action:', error);
    }
  }

  // Process rules against incoming data
  static async processRules(data: any, source: string = 'system'): Promise<void> {
    const rules = await this.getActiveRules();

    for (const rule of rules) {
      if (this.evaluateCondition(rule.condition, data)) {
        await this.executeAction(rule.action, { ...data, rule_id: rule.id, source });
      }
    }
  }

  // Test rule with sample data
  static async testRule(ruleId: string, testData: any): Promise<{ triggered: boolean; actions: any[] }> {
    const rule = await this.getRuleById(ruleId);
    if (!rule) {
      throw new Error('Rule not found');
    }

    const triggered = this.evaluateCondition(rule.condition, testData);
    const actions = triggered ? [rule.action] : [];

    return { triggered, actions };
  }

  // Private methods for actions
  private static async callWebhook(webhookConfig: any, data: any): Promise<void> {
    const { url, method = 'POST', headers = {}, body } = webhookConfig;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(body || data)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  private static async sendEmail(emailConfig: any, data: any): Promise<void> {
    // Placeholder for email service integration
    console.log('Sending email:', emailConfig, data);
    // Implement actual email sending logic here
  }

  private static async sendSMS(smsConfig: any, data: any): Promise<void> {
    // Placeholder for SMS service integration
    console.log('Sending SMS:', smsConfig, data);
    // Implement actual SMS sending logic here
  }
}
