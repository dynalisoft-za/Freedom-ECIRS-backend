import { nanoid } from 'nanoid';
import { query } from '../config/database';
import { Client } from '../types';
import { CreateClientInput, UpdateClientInput } from '../schemas/client.schema';

export const clientService = {
  async findAll(): Promise<Client[]> {
    const result = await query(
      'SELECT * FROM clients ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async findById(id: string): Promise<Client | null> {
    const result = await query('SELECT * FROM clients WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByTin(tin: string): Promise<Client | null> {
    const result = await query('SELECT * FROM clients WHERE tin = $1', [tin]);
    return result.rows[0] || null;
  },

  async create(data: CreateClientInput): Promise<Client> {
    const id = nanoid();
    const result = await query(
      `INSERT INTO clients (
        id, company_name, contact_person, email, phone, tin, type, address, balance, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        id,
        data.company_name,
        data.contact_person,
        data.email,
        data.phone,
        data.tin,
        data.type,
        data.address || null,
        0,
      ]
    );
    return result.rows[0];
  },

  async update(id: string, data: UpdateClientInput): Promise<Client | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = $${paramCount}`);
    values.push(id);

    const result = await query(
      `UPDATE clients SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM clients WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  },

  async updateBalance(id: string, amount: number): Promise<void> {
    await query(
      'UPDATE clients SET balance = balance + $1, updated_at = NOW() WHERE id = $2',
      [amount, id]
    );
  },
};
