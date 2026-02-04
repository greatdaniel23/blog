-- Seed admin user for development
-- In production, use proper password hashing (bcrypt)
INSERT OR IGNORE INTO admin_users (email, password_hash, name, role, is_active) VALUES
('admin@alphadigital.id', 'admin123', 'Admin User', 'admin', 1);
