import { Router } from 'express';
import { UserService } from '../services/userService';

const router = Router();
const userService = new UserService();

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const { role, status } = req.query;
    const filters: any = {};

    if (role) filters.role = role;
    if (status) filters.status = status;

    const users = await userService.getAllUsers(filters);
    // Remove sensitive data like biometric data from response
    const sanitizedUsers = users.map(user => ({
      ...user,
      biometric_data: undefined
    }));
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Remove sensitive biometric data
    const { biometric_data, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    // Remove sensitive biometric data from response
    const { biometric_data, ...sanitizedUser } = user;
    res.status(201).json(sanitizedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Remove sensitive biometric data
    const { biometric_data, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await userService.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST /api/users/:id/biometric - Update biometric data
router.post('/:id/biometric', async (req, res) => {
  try {
    const { biometric_type, data } = req.body;
    const result = await userService.updateBiometricData(req.params.id, biometric_type, data);
    res.json(result);
  } catch (error) {
    console.error('Error updating biometric data:', error);
    res.status(500).json({ error: 'Failed to update biometric data' });
  }
});

// GET /api/users/:id/access-permissions - Get user access permissions
router.get('/:id/access-permissions', async (req, res) => {
  try {
    const permissions = await userService.getUserAccessPermissions(req.params.id);
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching access permissions:', error);
    res.status(500).json({ error: 'Failed to fetch access permissions' });
  }
});

// PUT /api/users/:id/access-permissions - Update user access permissions
router.put('/:id/access-permissions', async (req, res) => {
  try {
    const permissions = await userService.updateUserAccessPermissions(req.params.id, req.body);
    res.json(permissions);
  } catch (error) {
    console.error('Error updating access permissions:', error);
    res.status(500).json({ error: 'Failed to update access permissions' });
  }
});

// POST /api/users/authenticate - Authenticate user (simplified)
router.post('/authenticate', async (req, res) => {
  try {
    const { identifier, biometric_data } = req.body;
    const result = await userService.authenticateUser(identifier, biometric_data);
    res.json(result);
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

export default router;
