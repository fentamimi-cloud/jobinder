-- Seed data for Jobinder development environment

-- Insert sample system metrics
INSERT INTO system_metrics (metric_name, metric_value, metric_unit, tags) VALUES
('total_users', 0, 'count', '{"type": "user_count"}'),
('total_jobs', 0, 'count', '{"type": "job_count"}'),
('total_matches', 0, 'count', '{"type": "match_count"}'),
('total_meetings', 0, 'count', '{"type": "meeting_count"}'),
('app_version', 1.0, 'version', '{"component": "api"}');

-- Insert sample email templates data (would be used by email service)
INSERT INTO email_queue (to_email, subject, html_content, status, scheduled_at) VALUES
('test@example.com', 'Welcome to Jobinder!', '<h1>Welcome!</h1><p>Thank you for joining Jobinder.</p>', 'sent', NOW() - INTERVAL '1 hour');

-- Insert sample notification preferences (these would normally be created when users register)
-- This is just for testing purposes
INSERT INTO notification_preferences (
    user_id, 
    email_enabled, 
    push_enabled, 
    sms_enabled,
    match_notifications,
    message_notifications,
    meeting_notifications,
    marketing_emails
) VALUES
('test-user-1', true, true, false, true, true, true, false),
('test-user-2', true, false, true, true, true, true, true);

-- Insert sample user analytics for testing
INSERT INTO user_analytics (user_id, event_type, event_data, session_id) VALUES
('test-user-1', 'user_login', '{"platform": "web", "source": "direct"}', 'session-123'),
('test-user-1', 'profile_view', '{"section": "personal_info"}', 'session-123'),
('test-user-2', 'user_login', '{"platform": "mobile", "source": "app_store"}', 'session-456'),
('test-user-2', 'job_search', '{"query": "software engineer", "filters": {"location": "San Francisco"}}', 'session-456');

-- Insert sample job analytics
INSERT INTO job_analytics (job_id, employer_id, metric_type, metric_value, metadata) VALUES
('job-1', 'employer-1', 'view', 15, '{"source": "search"}'),
('job-1', 'employer-1', 'application', 3, '{"conversion_rate": 0.2}'),
('job-2', 'employer-1', 'view', 25, '{"source": "recommendations"}'),
('job-2', 'employer-1', 'application', 5, '{"conversion_rate": 0.2}');

-- Insert sample match analytics
INSERT INTO match_analytics (
    match_id, 
    job_seeker_id, 
    employer_id, 
    job_id, 
    funnel_stage, 
    timestamp_occurred,
    additional_data
) VALUES
('match-1', 'seeker-1', 'employer-1', 'job-1', 'shown', NOW() - INTERVAL '2 hours', '{"recommendation_score": 0.85}'),
('match-1', 'seeker-1', 'employer-1', 'job-1', 'swiped', NOW() - INTERVAL '1 hour 45 minutes', '{"action": "like"}'),
('match-1', 'seeker-1', 'employer-1', 'job-1', 'matched', NOW() - INTERVAL '1 hour 30 minutes', '{"mutual": true}'),
('match-2', 'seeker-2', 'employer-1', 'job-2', 'shown', NOW() - INTERVAL '3 hours', '{"recommendation_score": 0.75}'),
('match-2', 'seeker-2', 'employer-1', 'job-2', 'swiped', NOW() - INTERVAL '2 hours 30 minutes', '{"action": "pass"}');

-- Insert sample ML training data
INSERT INTO ml_training_data (
    job_seeker_id,
    job_id,
    match_score,
    user_action,
    outcome,
    features
) VALUES
('seeker-1', 'job-1', 0.85, 'like', 'matched', '{"skills_match": 0.9, "location_match": 0.8, "experience_match": 0.85}'),
('seeker-1', 'job-2', 0.65, 'pass', 'rejected', '{"skills_match": 0.6, "location_match": 0.9, "experience_match": 0.5}'),
('seeker-2', 'job-1', 0.75, 'like', 'no_response', '{"skills_match": 0.8, "location_match": 0.7, "experience_match": 0.75}'),
('seeker-2', 'job-2', 0.55, 'pass', 'rejected', '{"skills_match": 0.5, "location_match": 0.6, "experience_match": 0.55}');

-- Update system metrics with the sample data counts
UPDATE system_metrics SET metric_value = 2 WHERE metric_name = 'total_users';
UPDATE system_metrics SET metric_value = 2 WHERE metric_name = 'total_jobs';
UPDATE system_metrics SET metric_value = 1 WHERE metric_name = 'total_matches';

COMMIT;
