-- Freedom ECIRS Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(21) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'station_manager', 'sales_executive', 'accountant', 'viewer')),
  station_codes TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(21) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  tin VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'agency')),
  address TEXT,
  balance BIGINT NOT NULL DEFAULT 0, -- Stored in kobo (NGN x 100)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id VARCHAR(21) PRIMARY KEY,
  doc_num VARCHAR(50) UNIQUE NOT NULL,
  client_id VARCHAR(21) NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  client_name VARCHAR(255) NOT NULL,
  campaign VARCHAR(255) NOT NULL,
  amount BIGINT NOT NULL, -- Stored in kobo
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'active', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  station_code VARCHAR(10) NOT NULL,
  created_by VARCHAR(21) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(21) PRIMARY KEY,
  doc_num VARCHAR(50) UNIQUE NOT NULL,
  contract_id VARCHAR(21) NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
  client_id VARCHAR(21) NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  amount BIGINT NOT NULL, -- Stored in kobo
  vat_amount BIGINT NOT NULL, -- Stored in kobo
  total_amount BIGINT NOT NULL, -- Stored in kobo
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  station_code VARCHAR(10) NOT NULL,
  created_by VARCHAR(21) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id VARCHAR(21) PRIMARY KEY,
  doc_num VARCHAR(50) UNIQUE NOT NULL,
  invoice_id VARCHAR(21) NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
  client_id VARCHAR(21) NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  amount BIGINT NOT NULL, -- Stored in kobo
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'pos')),
  payment_reference VARCHAR(255),
  station_code VARCHAR(10) NOT NULL,
  received_by VARCHAR(21) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Signatures table (for compliance)
CREATE TABLE IF NOT EXISTS document_signatures (
  id VARCHAR(21) PRIMARY KEY,
  document_type VARCHAR(50) NOT NULL,
  document_id VARCHAR(21) NOT NULL,
  signature_hash VARCHAR(255) NOT NULL,
  verification_code VARCHAR(50) UNIQUE NOT NULL,
  signed_by VARCHAR(21) NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_clients_tin ON clients(tin);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_station_code ON contracts(station_code);
CREATE INDEX idx_invoices_contract_id ON invoices(contract_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_station_code ON invoices(station_code);
CREATE INDEX idx_receipts_invoice_id ON receipts(invoice_id);
CREATE INDEX idx_receipts_client_id ON receipts(client_id);
CREATE INDEX idx_receipts_station_code ON receipts(station_code);
CREATE INDEX idx_document_signatures_verification_code ON document_signatures(verification_code);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
