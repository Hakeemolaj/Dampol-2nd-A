# Barangay Hall Web Application - Wireframes Specification

## Wireframe Overview

This document provides detailed wireframes for all major pages and user flows in the barangay web application, designed with accessibility and usability in mind.

## 1. Homepage Wireframe

### Desktop Layout (1024px+)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [🏛️ Logo] Barangay San Miguel                    [🔍 Search] [👤 Login] [☰] │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Home] [Services] [Announcements] [Officials] [About] [Contact] [Emergency] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        HERO SECTION                                        │
│                 Welcome to Barangay San Miguel                             │
│              Your Digital Gateway to Local Government                      │
│                                                                             │
│    [📄 Request Documents] [📢 View Announcements] [🚨 Emergency Hotline]   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ QUICK SERVICES                    │ LATEST ANNOUNCEMENTS                    │
│ ┌─────────────────────────────┐   │ ┌─────────────────────────────────────┐ │
│ │ 📄 Barangay Clearance      │   │ │ 📅 Dec 20 - Community Meeting      │ │
│ │ Fast processing, online     │   │ │ Monthly assembly at 7:00 PM        │ │
│ │ [Apply Now]                 │   │ └─────────────────────────────────────┘ │
│ └─────────────────────────────┘   │ ┌─────────────────────────────────────┐ │
│ ┌─────────────────────────────┐   │ │ 🏥 Dec 18 - Health Program         │ │
│ │ 🏠 Certificate of Residency │   │ │ Free medical checkup available      │ │
│ │ Proof of address            │   │ └─────────────────────────────────────┘ │
│ │ [Apply Now]                 │   │ ┌─────────────────────────────────────┐ │
│ └─────────────────────────────┘   │ │ 🚧 Dec 15 - Road Maintenance       │ │
│ ┌─────────────────────────────┐   │ │ Main street repair ongoing          │ │
│ │ 💼 Business Permit          │   │ └─────────────────────────────────────┘ │
│ │ Start your business         │   │ [View All Announcements]               │
│ │ [Apply Now]                 │   │                                         │
│ └─────────────────────────────┘   │                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ BARANGAY INFORMATION                                                        │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│ │ 👥 Officials│ │ 📊 Stats    │ │ 📍 Location │ │ 📞 Contact Information │ │
│ │ Meet your   │ │ Population: │ │ Address:    │ │ Office: (02) 123-4567  │ │
│ │ elected     │ │ 15,234      │ │ 123 Main St │ │ Email: info@brgy.gov   │ │
│ │ leaders     │ │ Households: │ │ San Miguel  │ │ Hours: 8AM - 5PM       │ │
│ │ [View All]  │ │ 3,456       │ │ [View Map]  │ │ [Contact Us]           │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                                      │
│ © 2024 Barangay San Miguel | Privacy Policy | Terms of Service | FOI       │
│ [Facebook] [Twitter] [Email] | Emergency: 911 | Barangay Hotline: 123-4567 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (320px-768px)
```
┌─────────────────────────────────────┐
│ ☰ Barangay San Miguel    [🔍] [👤] │
├─────────────────────────────────────┤
│                                     │
│         HERO SECTION                │
│    Welcome to Barangay              │
│       San Miguel                    │
│                                     │
│ [📄 Documents] [📢 News] [🚨 Help] │
│                                     │
├─────────────────────────────────────┤
│ QUICK SERVICES                      │
│ ┌─────────────────────────────────┐ │
│ │ 📄 Barangay Clearance          │ │
│ │ [Apply Now]                     │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🏠 Certificate of Residency     │ │
│ │ [Apply Now]                     │ │
│ └─────────────────────────────────┘ │
│ [View All Services]                 │
├─────────────────────────────────────┤
│ LATEST NEWS                         │
│ • Community Meeting - Dec 20        │
│ • Health Program - Dec 18           │
│ • Road Maintenance - Dec 15         │
│ [View All]                          │
├─────────────────────────────────────┤
│ QUICK CONTACT                       │
│ 📞 Emergency: 911                   │
│ 📞 Barangay: 123-4567              │
│ 📧 info@brgy.gov.ph                │
└─────────────────────────────────────┘
```

## 2. Services Page Wireframe

### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Navigation Header - Same as Homepage]                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ BREADCRUMB: Home > Services                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                           BARANGAY SERVICES                                │
│                     Access government services online                      │
│                                                                             │
│ [🔍 Search services...] [📂 All Categories ▼] [🔄 Sort by: Popular ▼]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ SERVICE CATEGORIES                                                          │
│ [📄 Documents] [🏢 Permits] [🆔 Certificates] [🚨 Emergency] [ℹ️ Info]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ DOCUMENT SERVICES                                                           │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐   │
│ │ 📄 Barangay         │ │ 🏠 Certificate of   │ │ 💰 Certificate of   │   │
│ │    Clearance        │ │    Residency        │ │    Indigency        │   │
│ │                     │ │                     │ │                     │   │
│ │ Fee: ₱50.00        │ │ Fee: ₱30.00        │ │ Fee: FREE           │   │
│ │ Time: 1-2 days     │ │ Time: 1 day        │ │ Time: 2-3 days     │   │
│ │                     │ │                     │ │                     │   │
│ │ Requirements:       │ │ Requirements:       │ │ Requirements:       │   │
│ │ • Valid ID          │ │ • Valid ID          │ │ • Valid ID          │   │
│ │ • Proof of Address  │ │ • Utility Bill      │ │ • Income Statement  │   │
│ │                     │ │                     │ │                     │   │
│ │ [Apply Now]         │ │ [Apply Now]         │ │ [Apply Now]         │   │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘   │
│                                                                             │
│ PERMIT SERVICES                                                             │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐   │
│ │ 🏢 Business Permit  │ │ 🏗️ Building Permit │ │ 🎪 Event Permit    │   │
│ │                     │ │                     │ │                     │   │
│ │ Fee: ₱100.00       │ │ Fee: Varies         │ │ Fee: ₱200.00       │   │
│ │ Time: 3-5 days     │ │ Time: 7-14 days    │ │ Time: 2-3 days     │   │
│ │                     │ │                     │ │                     │   │
│ │ [Apply Now]         │ │ [Apply Now]         │ │ [Apply Now]         │   │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│ NEED HELP?                                                                  │
│ 📞 Call us: (02) 123-4567 | 📧 Email: services@brgy.gov.ph               │
│ 🕒 Office Hours: Monday-Friday 8:00 AM - 5:00 PM                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Document Request Form Wireframe

### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Navigation Header]                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ BREADCRUMB: Home > Services > Document Request                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                        DOCUMENT REQUEST FORM                               │
│                                                                             │
│ STEP 1 OF 4: Document Information                                          │
│ [●●○○] Progress Indicator                                                   │
│                                                                             │
│ Document Type *                                                             │
│ [Barangay Clearance                                              ▼]        │
│                                                                             │
│ Purpose of Request *                                                        │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ Please specify the purpose for requesting this document...          │   │
│ │                                                                     │   │
│ │                                                                     │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│ ℹ️ This information is required for processing your request                │
│                                                                             │
│ Urgency Level                                                               │
│ ○ Regular (1-2 days) - ₱50.00                                             │
│ ○ Rush (Same day) - ₱100.00                                               │
│                                                                             │
│ DOCUMENT REQUIREMENTS                                                       │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ For Barangay Clearance, you need:                                  │   │
│ │ ✓ Valid government-issued ID                                        │   │
│ │ ✓ Proof of residency (utility bill, lease contract)               │   │
│ │ ✓ Recent passport-size photo (2x2)                                │   │
│ │ ✓ Completed application form                                        │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                              [Cancel] [Next: Upload Files] │
├─────────────────────────────────────────────────────────────────────────────┤
│ HELP & SUPPORT                                                              │
│ 📞 Need assistance? Call (02) 123-4567 or email help@brgy.gov.ph          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Admin Dashboard Wireframe

### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏛️ Barangay Admin Portal                           [👤 Admin] [🔔] [⚙️] [↗️] │
├─────────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR          │ MAIN DASHBOARD                                           │
│ ┌─────────────┐  │ ┌─────────────────────────────────────────────────────┐ │
│ │ 📊 Dashboard│  │ │ OVERVIEW STATISTICS                                 │ │
│ │ 👥 Residents│  │ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐ │ │
│ │ 📄 Documents│  │ │ │ 👥 Total│ │ 📄 Pending│ │ 💰 Revenue│ │ 🆕 New Today│ │ │
│ │ 📢 Announce │  │ │ │ 15,234  │ │ 47 Docs │ │ ₱12,500 │ │ 8 Residents │ │ │
│ │ 📅 Events   │  │ │ │ Residents│ │ Requests│ │ This Mo │ │ Registered  │ │ │
│ │ 💰 Finance  │  │ │ └─────────┘ └─────────┘ └─────────┘ └─────────────┘ │ │
│ │ 📊 Reports  │  │ └─────────────────────────────────────────────────────┘ │
│ │ ⚙️ Settings │  │ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔐 Users    │  │ │ RECENT ACTIVITIES                                   │ │
│ │ 📋 Audit    │  │ │ 🕐 2 min ago - New document request submitted       │ │
│ └─────────────┘  │ │ 🕐 5 min ago - Payment received for BR-2024-001     │ │
│                  │ │ 🕐 10 min ago - New resident registration           │ │
│                  │ │ 🕐 15 min ago - Document BR-2024-002 approved       │ │
│                  │ │ [View All Activities]                               │ │
│                  │ └─────────────────────────────────────────────────────┘ │
│                  │ ┌─────────────────────────────────────────────────────┐ │
│                  │ │ PENDING ACTIONS                                     │ │
│                  │ │ ┌─────────────────────────────────────────────────┐ │ │
│                  │ │ │ 📄 Document Requests Awaiting Approval (12)    │ │ │
│                  │ │ │ [Review Now]                                    │ │ │
│                  │ │ └─────────────────────────────────────────────────┘ │ │
│                  │ │ ┌─────────────────────────────────────────────────┐ │ │
│                  │ │ │ 👥 Resident Registrations Pending (3)          │ │ │
│                  │ │ │ [Review Now]                                    │ │ │
│                  │ │ └─────────────────────────────────────────────────┘ │ │
│                  │ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│ Footer: Last login: Dec 19, 2024 10:30 AM | System Status: ✅ All systems operational │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5. Mobile Navigation Wireframe

### Mobile Menu (Hamburger)
```
┌─────────────────────────────────────┐
│ ✕ MENU                              │
├─────────────────────────────────────┤
│ 🏠 Home                             │
│ 📄 Services                         │
│   • Document Requests               │
│   • Permits & Licenses             │
│   • Certificates                   │
├─────────────────────────────────────┤
│ 📢 Announcements                    │
│ 👥 Barangay Officials               │
│ 📍 About Barangay                   │
│ 📞 Contact Us                       │
├─────────────────────────────────────┤
│ 🚨 EMERGENCY                        │
│ 📞 911 - Police/Fire/Medical       │
│ 📞 123-4567 - Barangay Hotline     │
├─────────────────────────────────────┤
│ 👤 My Account                       │
│   • Profile                        │
│   • My Requests                    │
│   • Settings                       │
│   • Logout                         │
├─────────────────────────────────────┤
│ 🌐 Language: English ▼             │
│ 🔍 Search                          │
└─────────────────────────────────────┘
```

## 6. Accessibility Features in Wireframes

### Focus States
- **High Contrast Borders:** Blue outline on focused elements
- **Skip Links:** "Skip to main content" for keyboard users
- **Tab Order:** Logical navigation sequence

### Screen Reader Support
- **Headings Hierarchy:** H1 > H2 > H3 structure
- **ARIA Labels:** Descriptive labels for interactive elements
- **Alt Text:** All images have descriptive alternative text

### Error States
```
┌─────────────────────────────────────┐
│ Email Address *                     │
│ [user@example.com              ] ❌ │
│ ⚠️ Please enter a valid email address │
└─────────────────────────────────────┘
```

### Loading States
```
┌─────────────────────────────────────┐
│ ⏳ Processing your request...       │
│ [████████████████████████████] 85%  │
│ Please wait while we submit your    │
│ document request.                   │
└─────────────────────────────────────┘
```

## 7. Responsive Breakpoints

### Mobile First Design
- **320px:** Small phones (iPhone SE)
- **480px:** Large phones (iPhone 12)
- **768px:** Tablets (iPad)
- **1024px:** Desktop (Laptop)
- **1280px:** Large desktop

### Component Adaptations
- **Navigation:** Hamburger menu on mobile, full nav on desktop
- **Cards:** Single column on mobile, grid on desktop
- **Forms:** Stacked labels on mobile, side-by-side on desktop
- **Tables:** Horizontal scroll on mobile, full view on desktop

---

*Wireframes Version: 1.0*
*Last Updated: December 19, 2024*
*Accessibility: WCAG 2.0 AA Compliant*
*Responsive: Mobile-First Design*
