-- Seed data for document types
-- Common documents issued by Philippine barangays

INSERT INTO document_types (id, name, description, fee_amount, processing_days, requirements, is_active) VALUES
(
  uuid_generate_v4(),
  'Barangay Clearance',
  'Certificate of good moral character and standing in the community',
  50.00,
  3,
  '["Valid ID", "Proof of Residency", "Cedula"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Certificate of Residency',
  'Certification that the person is a resident of the barangay',
  30.00,
  2,
  '["Valid ID", "Proof of Residency"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Certificate of Indigency',
  'Certification for low-income families to avail of government services',
  0.00,
  3,
  '["Valid ID", "Proof of Residency", "Income Statement or Affidavit"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Business Permit (Micro)',
  'Permit for small-scale business operations within the barangay',
  100.00,
  5,
  '["Valid ID", "Business Registration", "Proof of Business Location", "Cedula"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Certificate of No Pending Case',
  'Certification that the person has no pending legal cases in the barangay',
  25.00,
  3,
  '["Valid ID", "Proof of Residency", "Cedula"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Barangay ID',
  'Official identification card for barangay residents',
  20.00,
  7,
  '["Valid ID", "Proof of Residency", "2x2 Photo"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Certificate of Cohabitation',
  'Certification for couples living together without marriage',
  40.00,
  3,
  '["Valid IDs of both parties", "Proof of Residency", "Affidavit of Cohabitation"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Certificate of No Improvement',
  'Certification that no improvements were made on a property',
  35.00,
  3,
  '["Valid ID", "Property Documents", "Tax Declaration"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'First Time Job Seeker Certificate',
  'Certification for first-time job seekers to avail of tax exemptions',
  0.00,
  2,
  '["Valid ID", "Proof of Residency", "Affidavit of First Time Job Seeker"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Senior Citizen ID',
  'Identification card for senior citizens (60 years old and above)',
  0.00,
  5,
  '["Valid ID", "Birth Certificate", "Proof of Residency", "2x2 Photo"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'PWD ID',
  'Identification card for Persons with Disabilities',
  0.00,
  7,
  '["Valid ID", "Medical Certificate", "Proof of Residency", "2x2 Photo"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Solo Parent ID',
  'Identification card for solo parents',
  0.00,
  5,
  '["Valid ID", "Birth Certificate of Child", "Proof of Solo Parent Status", "2x2 Photo"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Certificate of Tribal Membership',
  'Certification for members of indigenous communities',
  0.00,
  5,
  '["Valid ID", "Proof of Residency", "Tribal Council Endorsement"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Complaint Certificate',
  'Official documentation of filed complaints',
  15.00,
  1,
  '["Valid ID", "Incident Report", "Supporting Documents"]'::jsonb,
  true
),
(
  uuid_generate_v4(),
  'Travel Permit',
  'Permit for residents traveling outside the barangay (if required)',
  10.00,
  1,
  '["Valid ID", "Proof of Residency", "Travel Itinerary"]'::jsonb,
  true
);

-- Add comments
COMMENT ON TABLE document_types IS 'Available document types that can be requested from the barangay';

-- Update the updated_at timestamp
UPDATE document_types SET updated_at = NOW();
