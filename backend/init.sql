-- FinanSmart - Database Schema
-- MySQL 8.0+

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS helpeconomia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE helpeconomia;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255), -- Nullable for Google Auth users
  role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
  
  -- Monetization & Auth Fields
  subscription_status ENUM('active', 'inactive', 'trial', 'canceled') DEFAULT 'trial',
  subscription_id VARCHAR(255), -- Kiwify ID
  trial_ends_at DATETIME,
  google_id VARCHAR(255),
  photo_url VARCHAR(500),
  reset_token VARCHAR(255),
  reset_token_expires DATETIME,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_google_id (google_id),
  INDEX idx_subscription (subscription_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Cartões de Crédito
CREATE TABLE IF NOT EXISTS credit_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  brand VARCHAR(50) NOT NULL, -- Visa, Mastercard, Elo, etc
  limit_amount DECIMAL(10,2) NOT NULL,
  closing_day INT NOT NULL,
  due_day INT NOT NULL,
  color_theme VARCHAR(50) DEFAULT 'purple', -- Para a UI bonitona
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  description VARCHAR(500) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('INCOME', 'FIXED_EXPENSE', 'VARIABLE_EXPENSE', 'INVESTMENT') NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  observation TEXT,
  payment_method ENUM('CREDITO', 'DÉBITO', 'PIX', 'CREDITO PARCELADO'),
  importance ENUM('ESSENCIAL', 'SUPERFLUO'),
  credit_card_id INT DEFAULT NULL,
  installments INT DEFAULT NULL,
  installment_number INT DEFAULT NULL,
  invoice_date DATE DEFAULT NULL, -- Data base da fatura que esta transação pertence
  recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id) ON DELETE SET NULL,
  INDEX idx_user_date (user_id, date),
  INDEX idx_type (type),
  INDEX idx_category (category),
  INDEX idx_card_invoice (credit_card_id, invoice_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados Iniciais (Seed)
-- Usuário Admin Principal
INSERT INTO users (name, email, password, role) VALUES 
('Flávio Castro', 'fcso.oliveira@gmail.com', 'Castr0@2715', 'ADMIN');

-- Usuário Demo para Testes
INSERT INTO users (name, email, password, role) VALUES 
('Usuário Demo', 'user@demo.com', '123', 'USER');

-- Transações de Exemplo para o Admin (opcional)
INSERT INTO transactions (user_id, description, amount, type, category, date, payment_method, importance) VALUES
(1, 'Salário Mensal', 6700.00, 'INCOME', 'Salário', '2024-05-01', NULL, NULL),
(1, 'Supermercado Pão de Açúcar', 450.20, 'VARIABLE_EXPENSE', 'Alimentação', '2024-05-14', 'CREDITO', 'ESSENCIAL'),
(1, 'Aluguel Apartamento', 2595.50, 'FIXED_EXPENSE', 'Moradia', '2024-05-05', 'PIX', 'ESSENCIAL'),
(1, 'Investimento Tesouro Direto', 800.00, 'INVESTMENT', 'Renda Fixa', '2024-05-10', 'PIX', NULL),
(1, 'Posto Ipiranga', 220.00, 'VARIABLE_EXPENSE', 'Transporte', '2024-05-22', 'DÉBITO', 'ESSENCIAL'),
(1, 'Aluguel Apartamento', 1800.00, 'FIXED_EXPENSE', 'Moradia', '2024-03-20', 'PIX', 'ESSENCIAL');
