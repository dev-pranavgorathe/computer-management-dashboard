-- Clear existing data
DELETE FROM "ApprovalRequest";
DELETE FROM "Redeployment";
DELETE FROM "Repossession";
DELETE FROM "Complaint";
DELETE FROM "Shipment";

-- Insert Shipments
INSERT INTO "Shipment" ("id", "refId", "podName", "shippingAddress", "contactPerson", "mobileNumber", "status", "orderDate", "userId", "createdAt", "updatedAt", "cpus") VALUES 
('ship001', 'SHP-001', 'POD Pune Central', '123 MG Road, Pune', 'Rahul Sharma', '+91 9876543210', 'DELIVERED', '2024-01-15', (SELECT id FROM "User" LIMIT 1), NOW(), NOW(), 20),
('ship002', 'SHP-002', 'POD Mumbai West', '456 Linking Road, Mumbai', 'Priya Patel', '+91 9876543211', 'IN_TRANSIT', '2024-02-01', (SELECT id FROM "User" LIMIT 1), NOW(), NOW(), 15),
('ship003', 'SHP-003', 'POD Delhi North', '789 CP, Delhi', 'Amit Kumar', '+91 9876543212', 'PENDING', '2024-02-10', (SELECT id FROM "User" LIMIT 1), NOW(), NOW(), 25);

-- Insert Complaints
INSERT INTO "Complaint" ("id", "refId", "ticket", "podName", "deviceType", "issue", "description", "status", "priority", "reportedDate", "createdAt") VALUES 
('cmp001', 'CMP-001', 'TKT-001', 'POD Pune Central', 'CPU', 'System not booting', 'No display on boot', 'OPEN', 'HIGH', '2024-02-01', NOW()),
('cmp002', 'CMP-002', 'TKT-002', 'POD Mumbai West', 'MONITOR', 'Screen flickering', 'Flickers after 30 mins', 'IN_PROGRESS', 'MEDIUM', '2024-02-05', NOW()),
('cmp003', 'CMP-003', 'TKT-003', 'POD Delhi North', 'KEYBOARD', 'Keys not working', 'A, S, D keys failed', 'SOLVED', 'LOW', '2024-01-28', NOW());

-- Insert Repossessions
INSERT INTO "Repossession" ("id", "refId", "ticket", "podName", "shippingAddress", "contactPerson", "mobileNumber", "status", "requestDate", "createdAt") VALUES 
('rep001', 'REP-001', 'RPT-001', 'POD Hyderabad Old', '999 Banjara Hills', 'Vikram Singh', '+91 9876543215', 'COLLECTED', '2024-01-20', NOW()),
('rep002', 'REP-002', 'RPT-002', 'POD Kolkata East', '111 Park Street', 'Debashish Roy', '+91 9876543216', 'IN_TRANSIT', '2024-02-01', NOW());

-- Insert Redeployments
INSERT INTO "Redeployment" ("id", "refId", "podName", "shippingAddress", "contactPerson", "mobileNumber", "sourcePod", "status", "orderDate", "createdAt") VALUES 
('rdp001', 'RDP-001', 'POD Lucknow New', '444 Hazratganj', 'Suresh Yadav', '+91 9876543219', 'POD Hyderabad Old', 'DELIVERED', '2024-01-28', NOW()),
('rdp002', 'RDP-002', 'POD Chandigarh Tech', '555 Sector 17', 'Manpreet Kaur', '+91 9876543220', 'POD Kolkata East', 'IN_TRANSIT', '2024-02-05', NOW());
