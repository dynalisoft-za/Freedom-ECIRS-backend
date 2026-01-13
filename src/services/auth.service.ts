import { nanoid } from 'nanoid';
import { query } from '../config/database';
import { User, JWTPayload } from '../types';
import { hashPassword, comparePassword } from '../utils/auth';
import { RegisterInput } from '../schemas/auth.schema';

export const authService = {
  async findByUsername(username: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE username = $1', [
      username,
    ]);
    return result.rows[0] || null;
  },

  async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async register(data: RegisterInput): Promise<User> {
    const id = nanoid();
    const passwordHash = await hashPassword(data.password);

    const result = await query(
      `INSERT INTO users (
        id, username, email, password_hash, full_name, phone, role, station_codes, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        id,
        data.username,
        data.email,
        passwordHash,
        data.full_name,
        data.phone,
        data.role,
        data.station_codes,
        'active',
      ]
    );

    return result.rows[0];
  },

  async verifyPassword(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isValid = await comparePassword(password, user.password_hash);
    return isValid ? user : null;
  },

  userToJWTPayload(user: User): JWTPayload {
    return {
      userId: user.id,
      username: user.username,
      role: user.role,
      stationCodes: user.station_codes,
    };
  },
};
