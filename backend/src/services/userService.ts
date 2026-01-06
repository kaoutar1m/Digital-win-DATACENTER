import { User } from '../models/User'; // Supprimez BiometricData et AccessPermission

export class UserService {
  private users: User[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with mock user data
    this.users = [
      {
        id: 'user-001',
        username: 'admin',
        name: 'System Administrator',
        email: 'admin@datacenter.com',
        password_hash: 'hashed_password_123',
        role: 'admin',
        is_active: true,
        access_permissions: [
          { zone_id: 'zone-001', level: 'admin' },
          { zone_id: 'zone-002', level: 'admin' }
        ],
        biometric_data: {
          fingerprint_hash: 'fingerprint_hash_123',
          facial_data: 'facial_hash_456',
          iris_pattern: 'iris_hash_789',
          last_updated: new Date()
        },
        last_login: new Date(),
        created_at: new Date('2024-01-01'),
        updated_at: new Date()
      },
      {
        id: 'user-002',
        username: 'johnsmith',
        name: 'John Smith',
        email: 'tech@datacenter.com',
        password_hash: 'hashed_password_abc',
        role: 'operator',
        is_active: true,
        access_permissions: [
          { zone_id: 'zone-001', level: 'write' }
        ],
        biometric_data: {
          fingerprint_hash: 'fingerprint_hash_abc',
          facial_data: 'facial_hash_def',
          last_updated: new Date()
        },
        last_login: new Date(Date.now() - 86400000), // 1 day ago
        created_at: new Date('2024-01-01'),
        updated_at: new Date()
      }
    ];
  }

  async getAllUsers(filters: any = {}): Promise<User[]> {
    let filteredUsers = [...this.users];

    if (filters.role) {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }

    if (filters.status) {
      filteredUsers = filteredUsers.filter(user => user.status === filters.status);
    }

    return filteredUsers;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: userData.username || 'newuser',
      email: userData.email!,
      password_hash: userData.password_hash || 'default_hash',
      role: userData.role || 'viewer',
      is_active: userData.is_active ?? true,
      name: userData.name,
      status: userData.status,
      first_name: userData.first_name,
      last_name: userData.last_name,
      department: userData.department,
      employee_id: userData.employee_id,
      biometric_data: userData.biometric_data,
      access_permissions: userData.access_permissions,
      login_attempts: userData.login_attempts || 0,
      created_at: new Date(),
      updated_at: new Date(),
      last_login: userData.last_login
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;

    this.users[index] = {
      ...this.users[index],
      ...updates,
      updated_at: new Date()
    };

    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }

  async updateBiometricData(userId: string, biometricType: string, data: string): Promise<any> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.biometric_data) {
      user.biometric_data = {
        last_updated: new Date()
      };
    }

    // Handle last_updated field specially as it should be a Date
    if (biometricType === 'last_updated') {
      (user.biometric_data as any)[biometricType] = new Date(data);
    } else {
      (user.biometric_data as any)[biometricType] = data;
    }

    user.updated_at = new Date();

    return {
      success: true,
      message: `${biometricType} data updated`,
      user_id: userId,
      timestamp: new Date()
    };
  }

  async getUserAccessPermissions(userId: string): Promise<any> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user.access_permissions;
  }

  async updateUserAccessPermissions(userId: string, permissions: any): Promise<any> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.access_permissions = Object.assign({}, user.access_permissions, permissions);
    user.updated_at = new Date();

    return user.access_permissions;
  }

  async authenticateUser(identifier: string, biometricData?: any): Promise<any> {
    // Find user by username or email
    const user = this.users.find(u =>
      u.username === identifier ||
      u.email === identifier
    );

    if (!user) {
      throw new Error('User not found');
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    // In a real implementation, this would verify biometric data
    // For now, we'll simulate successful authentication
    user.last_login = new Date();
    user.login_attempts = 0;
    user.updated_at = new Date();

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        department: user.department
      },
      token: `mock_jwt_token_${user.id}`,
      timestamp: new Date()
    };
  }

  // Simulate failed login attempt
  async recordFailedLogin(identifier: string): Promise<void> {
    const user = this.users.find(u =>
      u.username === identifier ||
      u.email === identifier
    );

    if (user) {
      user.login_attempts += 1;
      user.updated_at = new Date();

      // Lock account after 5 failed attempts
      if (user.login_attempts >= 5) {
        user.status = 'locked';
      }
    }
  }
}
