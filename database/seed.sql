-- Clear existing data
TRUNCATE TABLE password_reset_tokens RESTART IDENTITY CASCADE;
TRUNCATE TABLE sessions RESTART IDENTITY CASCADE;
TRUNCATE TABLE likes RESTART IDENTITY CASCADE;
TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;
TRUNCATE TABLE documents RESTART IDENTITY CASCADE;
TRUNCATE TABLE messages RESTART IDENTITY CASCADE;
TRUNCATE TABLE comments RESTART IDENTITY CASCADE;
TRUNCATE TABLE posts RESTART IDENTITY CASCADE;
TRUNCATE TABLE profiles RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Insert test users
-- Password hashes are bcrypt for: password123
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
  ('alice_student', 'alice@campus.edu', '$2b$10$YourHashedPasswordHere123Alice', 'student', TRUE),
  ('bob_student', 'bob@campus.edu', '$2b$10$YourHashedPasswordHere123Bob', 'student', TRUE),
  ('charlie_student', 'charlie@campus.edu', '$2b$10$YourHashedPasswordHereCharlie', 'student', TRUE),
  ('diana_student', 'diana@campus.edu', '$2b$10$YourHashedPasswordHere123Diana', 'student', TRUE),
  ('eve_student', 'eve@campus.edu', '$2b$10$YourHashedPasswordHere123Eve', 'student', TRUE),
  ('carol_mod', 'carol@campus.edu', '$2b$10$YourHashedPasswordHereCarol123', 'moderator', TRUE),
  ('dave_admin', 'dave@campus.edu', '$2b$10$YourHashedPasswordHere123Dave', 'admin', TRUE);

-- Insert profiles
INSERT INTO profiles (user_id, full_name, bio, major, location) VALUES
  (1, 'Alice Johnson', 'Computer Science enthusiast, love coding', 'Computer Science', 'Dorm A - Room 101'),
  (2, 'Bob Smith', 'Interested in machine learning and AI', 'Data Science', 'Dorm B - Room 205'),
  (3, 'Charlie Brown', 'Mathematics major, tutor at campus center', 'Mathematics', 'Dorm C - Room 310'),
  (4, 'Diana Prince', 'Physics and astrophysics', 'Physics', 'Dorm A - Room 205'),
  (5, 'Eve Davis', 'Engineering student, robotics club president', 'Mechanical Engineering', 'Dorm D - Room 115'),
  (6, 'Carol Martinez', 'Campus moderator, senior RA', 'Business Administration', 'RA Office'),
  (7, 'Dave Wilson', 'Campus administrator', 'Administration', 'Admin Building');

-- Insert posts
INSERT INTO posts (user_id, title, content, visibility) VALUES
  (1, 'First Week Tips', 'Here are some tips for freshmen: 1. Arrive early to classes. 2. Join clubs. 3. Make friends in your dorm.', 'public'),
  (2, 'Machine Learning Study Group', 'Looking for people interested in ML. Meeting every Thursday at library.', 'public'),
  (3, 'Math Tutoring Available', 'I offer free tutoring for Calculus and Linear Algebra. Message me for details!', 'public'),
  (1, 'Private Thoughts', 'This is a private post only I can see', 'private'),
  (4, 'Physics Club Announcement', 'Physics club will meet next Tuesday. Discussing quantum mechanics.', 'public'),
  (5, 'Robotics Competition Update', 'Our team is preparing for the spring competition. Looking for new members!', 'public'),
  (2, 'Study Session Reminder', 'Don''t forget: study session tomorrow at 6 PM in the common room', 'public'),
  (3, 'Course Review: Discrete Math', 'Just finished Discrete Math. Great course, challenging but rewarding.', 'public');

-- Insert comments
INSERT INTO comments (post_id, user_id, content) VALUES
  (1, 2, 'Great tips! I wish I knew this before starting.'),
  (1, 3, 'Joining clubs is the best advice. That''s how I made my friends.'),
  (2, 1, 'I''m interested! When is the next meeting?'),
  (2, 4, 'Count me in! Machine learning is fascinating.'),
  (3, 5, 'Thank you so much for offering tutoring!'),
  (5, 1, 'Will you be covering wave-particle duality?'),
  (6, 2, 'This sounds amazing! I want to join.'),
  (8, 4, 'I''m currently taking this course. Definitely challenging!');

-- Insert messages
INSERT INTO messages (sender_id, recipient_id, content, is_read) VALUES
  (1, 2, 'Hi Bob! Do you want to grab coffee later?', FALSE),
  (2, 1, 'Sure! What time works for you?', TRUE),
  (3, 1, 'Hey Alice, can you help me with the CS assignment?', FALSE),
  (1, 3, 'Of course! Let''s meet at the library tomorrow.', TRUE),
  (4, 5, 'Diana here - interested in robotics?', FALSE),
  (5, 4, 'Always! Looking forward to meeting you.', TRUE),
  (2, 3, 'Charlie, your tutoring helped so much. Thanks!', FALSE),
  (3, 2, 'Happy to help! Keep up the great work.', TRUE);

-- Insert likes
INSERT INTO likes (post_id, user_id) VALUES
  (1, 2),
  (1, 3),
  (1, 4),
  (2, 1),
  (2, 3),
  (3, 1),
  (3, 5),
  (5, 1),
  (6, 1),
  (6, 2),
  (6, 3),
  (7, 4),
  (8, 1),
  (8, 2);

-- Insert notifications
INSERT INTO notifications (user_id, type, related_user_id, related_post_id, message) VALUES
  (1, 'comment', 2, 1, 'Bob commented on your post'),
  (1, 'message', 3, NULL, 'Charlie sent you a message'),
  (2, 'like', 1, 2, 'Alice liked your post'),
  (3, 'comment', 1, 3, 'Alice commented on your post'),
  (2, 'message', 1, NULL, 'Alice sent you a message'),
  (4, 'message', 5, NULL, 'Eve sent you a message'),
  (3, 'like', 2, 8, 'Bob liked your post');

-- Insert a document
INSERT INTO documents (user_id, filename, file_path, mime_type, file_size, is_public) VALUES
  (1, 'study_guide.pdf', '/uploads/1_study_guide.pdf', 'application/pdf', 2500000, FALSE),
  (3, 'linear_algebra_notes.pdf', '/uploads/3_linear_algebra_notes.pdf', 'application/pdf', 1800000, TRUE),
  (5, 'robotics_project_plan.pdf', '/uploads/5_robotics_project_plan.pdf', 'application/pdf', 3200000, FALSE);

-- Insert password reset token (example, will expire quickly)
INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES
  (1, 'reset_token_example_12345', CURRENT_TIMESTAMP + INTERVAL '1 hour', FALSE);
