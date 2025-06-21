-- Sample announcements for development and testing
-- Note: These use placeholder UUIDs for author_id - replace with actual admin user IDs

-- First, let's create a sample admin user profile (this would normally be done through registration)
-- This is just for seeding purposes
DO $$
DECLARE
    admin_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Insert sample admin profile if it doesn't exist
    INSERT INTO user_profiles (id, first_name, last_name, role, created_at, updated_at)
    VALUES (admin_user_id, 'Barangay', 'Administrator', 'admin', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Sample announcements
INSERT INTO announcements (id, title, summary, content, category, priority, is_published, published_at, expires_at, author_id, created_at, updated_at) VALUES
(
  uuid_generate_v4(),
  'Barangay Assembly - January 15, 2025',
  'Monthly barangay assembly for Dampol 2nd A residents to discuss community matters',
  'Join us for our monthly community meeting at the Dampol 2nd A Barangay Hall. We will discuss important matters affecting our community including upcoming infrastructure projects, community programs, and budget allocations for the next quarter. All residents are encouraged to attend.

Date: January 15, 2025
Time: 7:00 PM
Venue: Dampol 2nd A Barangay Hall

Agenda:
1. Call to Order
2. Reading of Previous Minutes
3. Infrastructure Updates
4. Community Programs
5. Budget Discussion
6. Open Forum
7. Adjournment

Light refreshments will be served. For inquiries, please contact the barangay office.',
  'Meeting',
  'normal',
  true,
  '2025-01-10 08:00:00+08',
  '2025-01-15 23:59:59+08',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'Free Medical Mission - January 20, 2025',
  'Health program available for all Dampol 2nd A residents',
  'We are pleased to announce a free medical mission for all Dampol 2nd A residents. This program includes basic health screening, blood pressure monitoring, consultation with licensed medical professionals, and free medicines.

Date: January 20, 2025
Time: 8:00 AM - 4:00 PM
Venue: Dampol 2nd A Barangay Hall

Services Available:
- General consultation
- Blood pressure monitoring
- Blood sugar testing
- BMI assessment
- Free basic medicines
- Health education

Requirements:
- Valid ID
- Barangay residency proof
- Senior citizens and PWDs will be prioritized

For more information, contact the Barangay Health Committee.',
  'Health',
  'normal',
  true,
  '2025-01-12 09:00:00+08',
  '2025-01-20 17:00:00+08',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'Road Improvement Project - Dampol Road',
  'Road concreting project ongoing, expect traffic delays',
  'Please be advised that road improvement work is currently ongoing on Dampol Road from 7:00 AM to 5:00 PM daily. The project includes road concreting and drainage improvement.

Project Details:
- Location: Dampol Road (Main thoroughfare)
- Duration: January 8 - February 28, 2025
- Working Hours: 7:00 AM - 5:00 PM (Monday to Saturday)
- Contractor: ABC Construction Company

Impact on Residents:
- Expect minor traffic delays during working hours
- Alternative routes are available via Purok 2 and Purok 4
- Heavy vehicles are advised to use bypass roads
- Emergency vehicles will have priority access

We apologize for any inconvenience and appreciate your patience as we work to improve our community infrastructure.',
  'Infrastructure',
  'urgent',
  true,
  '2025-01-08 06:00:00+08',
  '2025-02-28 18:00:00+08',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'New Garbage Collection Schedule',
  'Updated waste collection schedule effective January 2025',
  'Starting January 2025, garbage collection will be conducted every Tuesday and Friday. Residents are reminded to segregate waste properly and place garbage bins outside by 6:00 AM on collection days.

New Schedule:
- Collection Days: Tuesday and Friday
- Collection Time: 6:00 AM - 12:00 PM
- Segregation Required: Biodegradable, Non-biodegradable, Recyclable

Waste Segregation Guidelines:
- Green Bags: Biodegradable waste (food scraps, leaves)
- Black Bags: Non-biodegradable waste (plastic, diapers)
- Clear Bags: Recyclable materials (bottles, cans, paper)

Special Collections:
- Bulky items: First Saturday of the month
- Electronic waste: Last Saturday of the month
- Hazardous waste: By appointment only

Penalties for non-compliance:
- First offense: Warning
- Second offense: PHP 500 fine
- Third offense: PHP 1,000 fine

For questions, contact the Sanitation Department at the barangay office.',
  'Environment',
  'normal',
  true,
  '2024-12-12 07:00:00+08',
  NULL,
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'Barangay Sports Festival 2025',
  'Annual sports competition for all age groups',
  'The Barangay Sports Festival 2025 is now open for registration! Join us for a week-long celebration of sports and community spirit.

Event Details:
- Date: February 14-21, 2025
- Venue: Dampol 2nd A Sports Complex
- Registration Deadline: February 7, 2025

Categories:
- Kids (7-12 years): Running, Swimming, Basketball shooting
- Youth (13-17 years): Basketball, Volleyball, Badminton, Chess
- Adults (18-39 years): Basketball, Volleyball, Softball, Table Tennis
- Seniors (40+ years): Chess, Darts, Bowling

Prizes:
- 1st Place: PHP 5,000 + Trophy
- 2nd Place: PHP 3,000 + Medal
- 3rd Place: PHP 2,000 + Medal
- Participation Certificate for all

Registration:
- Fee: PHP 100 per person per event
- Maximum 3 events per person
- Team events require minimum 8 players

Register at the barangay office or contact our Sports Committee.',
  'Event',
  'normal',
  true,
  '2025-01-15 10:00:00+08',
  '2025-02-21 23:59:59+08',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'Emergency Preparedness Seminar',
  'Learn essential disaster preparedness and response skills',
  'In partnership with the Bureau of Fire Protection and Philippine Red Cross, we are conducting an Emergency Preparedness Seminar for all residents.

Seminar Details:
- Date: January 25, 2025
- Time: 2:00 PM - 5:00 PM
- Venue: Dampol 2nd A Covered Court
- Registration: Free

Topics to be covered:
1. Earthquake preparedness and response
2. Fire prevention and safety
3. Flood response and evacuation
4. First aid basics
5. Emergency communication
6. Family emergency planning

Resource Speakers:
- Fire Inspector Juan Dela Cruz (BFP Bulacan)
- Ms. Maria Santos (Philippine Red Cross)
- Dr. Pedro Reyes (Emergency Medicine)

What to bring:
- Notebook and pen
- Family members (children welcome)
- Questions about emergency preparedness

Certificates of participation will be given to all attendees. Light snacks will be provided.',
  'Safety',
  'high',
  true,
  '2025-01-18 14:00:00+08',
  '2025-01-25 17:00:00+08',
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
);

-- Add some draft announcements for testing
INSERT INTO announcements (id, title, summary, content, category, priority, is_published, published_at, expires_at, author_id, created_at, updated_at) VALUES
(
  uuid_generate_v4(),
  'Draft: Upcoming Vaccination Drive',
  'COVID-19 booster shots for eligible residents',
  'This is a draft announcement for an upcoming vaccination drive. Details are still being finalized.',
  'Health',
  'normal',
  false,
  NULL,
  NULL,
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
),
(
  uuid_generate_v4(),
  'Draft: Barangay Budget Hearing',
  'Public hearing for the 2025 barangay budget',
  'Draft announcement for the annual budget hearing. Date and venue to be confirmed.',
  'Meeting',
  'normal',
  false,
  NULL,
  NULL,
  '00000000-0000-0000-0000-000000000001',
  NOW(),
  NOW()
);

-- Update timestamps
UPDATE announcements SET updated_at = NOW();
