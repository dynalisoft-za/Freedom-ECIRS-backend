export interface Client {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  tin: string;
  type: 'direct' | 'agency';
  balance: number;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Contract {
  id: string;
  doc_num: string;
  client_id: string;
  client_name: string;
  campaign: string;
  amount: number;
  status: 'draft' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  start_date: Date;
  end_date: Date;
  created_by: string;
  station_code: string;
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: string;
  doc_num: string;
  contract_id: string;
  client_id: string;
  amount: number;
  vat_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: Date;
  station_code: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Receipt {
  id: string;
  doc_num: string;
  invoice_id: string;
  client_id: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'pos';
  payment_reference?: string;
  station_code: string;
  received_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string;
  role: 'super_admin' | 'station_manager' | 'sales_executive' | 'accountant' | 'viewer';
  station_codes: string[];
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  stationCodes: string[];
}

export type StationCode = 'FR-KAN' | 'FR-DUT' | 'FR-KAD' | 'DL-KAN';
