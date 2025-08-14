-- Seed initial cybersecurity training modules
INSERT INTO modules (title, description, content, duration_minutes, difficulty_level) VALUES
('Phishing Awareness', 'Learn to identify and avoid phishing attacks', 
'<h2>Understanding Phishing</h2><p>Phishing is a cybersecurity attack where attackers impersonate legitimate organizations to steal sensitive information...</p><h3>Common Signs of Phishing:</h3><ul><li>Urgent or threatening language</li><li>Suspicious sender addresses</li><li>Generic greetings</li><li>Requests for sensitive information</li></ul>', 
25, 'beginner'),

('Password Security', 'Best practices for creating and managing secure passwords',
'<h2>Password Security Fundamentals</h2><p>Strong passwords are your first line of defense against cyber attacks...</p><h3>Password Requirements:</h3><ul><li>Minimum 12 characters</li><li>Mix of uppercase, lowercase, numbers, symbols</li><li>Unique for each account</li><li>Use password managers</li></ul>',
20, 'beginner'),

('Physical Security', 'Protecting physical access to systems and data',
'<h2>Physical Security Controls</h2><p>Physical security is often overlooked but critical for comprehensive cybersecurity...</p><h3>Key Areas:</h3><ul><li>Access control systems</li><li>Clean desk policy</li><li>Device security</li><li>Visitor management</li></ul>',
30, 'intermediate'),

('Access Management', 'Understanding user access controls and permissions',
'<h2>Access Control Principles</h2><p>Proper access management ensures users have appropriate permissions...</p><h3>Core Principles:</h3><ul><li>Principle of least privilege</li><li>Role-based access control</li><li>Regular access reviews</li><li>Multi-factor authentication</li></ul>',
35, 'advanced');

-- Seed quiz questions for Phishing Awareness module
INSERT INTO quizzes (module_id, question, options, correct_option, explanation, points) VALUES
(1, 'Which of the following is a common sign of a phishing email?', 
'["Professional company logo", "Urgent action required", "Personalized greeting", "Clear contact information"]', 
1, 'Phishing emails often use urgent language to pressure victims into acting quickly without thinking.', 2),

(1, 'What should you do if you receive a suspicious email asking for your password?', 
'["Reply with your password", "Click the link to verify", "Delete the email and report it", "Forward it to colleagues"]', 
2, 'Never provide passwords via email. Delete suspicious emails and report them to your IT security team.', 2),

(1, 'Which domain is most likely to be legitimate for a bank called "SecureBank"?', 
'["secur3bank.com", "securebank-verify.net", "securebank.com", "secure-bank.org"]', 
2, 'Legitimate organizations use their official domain names. Be wary of variations or additional words.', 3);

-- Seed quiz questions for Password Security module
INSERT INTO quizzes (module_id, question, options, correct_option, explanation, points) VALUES
(2, 'What is the minimum recommended length for a secure password?', 
'["6 characters", "8 characters", "12 characters", "16 characters"]', 
2, 'Current security standards recommend at least 12 characters for adequate password strength.', 2),

(2, 'Which of these is the most secure password?', 
'["Password123!", "MyDog2023", "Tr0ub4dor&3", "correct-horse-battery-staple"]', 
3, 'Passphrases with random words are both secure and memorable, following modern password guidelines.', 3);

-- Create default admin user (password: Admin123!)
INSERT INTO users (name, email, password, role, consent_rgpd) VALUES
('System Administrator', 'admin@smsi-platform.com', '$2b$12$LQv3c1yqBw2fyuPiHn5ufOHCkRg/QkdqipmSzsMNlx8HKk8vxuFHy', 'admin', TRUE);
