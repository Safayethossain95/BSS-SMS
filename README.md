# BSS SMS - Institutional SMS Dispatch & Broadcast System

A modern, fast, and feature-rich Web-based SMS Sending Portal inspired by the legacy **MailMessageDeliveryForm** ("BSS"). Built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## 🌟 Key Features & Workflow (Parity with Screenshot + Pro UX)

### 1. Hierarchical Cascading Filter (Class → Section → Load)
- **Class Dropdown**: Choose between *Play Group*, *Nursery*, *Kindergarten (KG)*, *Class 1*, *Class 2*, and *Staff & Teachers*.
- **Dynamic Section Dropdown**: Automatically updates its options based on the chosen class (e.g. `Starter`, `Play-D1`, `Play-D2`, `Nur-D1`, `Nur-D2`).
- **Load Students Button**: Fetches and renders the matching student roster into the interactive recipient directory with instant feedback.
- **Batch Group Transfer (Image Feature)**: Two-way listbox (`Available Group` ⇄ `Destination Group` with `>>` and `<<` buttons) allowing multi-section broadcast targeting.
- **Alert Sent To**: Real-time status chip showing the targeted audience (e.g. `Play Group > Starter (4 Selected)`).

### 2. Message Composer & Accurate SMS Metrics
- **Template Selector**: Choose from standard school templates (*Emergency Closure Notice*, *Tuition Fee Due Reminder*, *Parent-Teacher Meeting*, *Absence Notice*, *Exam Routine*, *Holiday Greetings*).
- **Dynamic Variable Tags**: Clickable pills (`{StudentName}`, `{StudentID}`, `{Class}`, `{Section}`, `{Roll}`) to insert variables at cursor position.
- **Real-Time SMS Metrics Bar**:
  - **SMS Length**: Live character counter.
  - **Character Remain**: Counts down remaining characters in the current SMS segment.
  - **Total SMS / Person**: Calculates multi-part concatenated SMS segments (160 characters for 1st SMS, 153 for multi-part GSM-7; auto-switches to 70/67 for Unicode/Bangla).
  - **Total Recipient**: Live tally of selected student recipients.
  - **Total SMS Units**: Total billing credits required for the broadcast dispatch.
- **Live Recipient Device Mockup**: Interactive smartphone simulator displaying the message rendered inside an iOS/Android SMS bubble with personalized variables replaced.

### 3. Student Recipient Directory
- **Select All / Indeterminate Checkbox**: Select or deselect all students with one click; indeterminate state supported.
- **Real-Time Search**: Instant search filtering across `HEADERID`, `Student ID`, `Recipient Name`, and `Mobile Number`.
- **One-Click Copy**: Copy Student ID or formatted phone number to clipboard with visual checkmark feedback.
- **Quick Single Test**: Send a test SMS to an individual student directly from the table row.

### 4. Sending, Logs & Management
- **Confirmation Dialogue & Telco Gateway Simulation**: Review recipients, segments, and units before sending. Transmits through simulated gateway with progress bar and celebratory confetti.
- **SMS Delivery Audit Logs**: Modal containing complete history of previous dispatches, delivered status, and **one-click CSV export**.
- **Template Manager**: Add custom SMS templates or manage existing ones.
- **Test SMS Tool**: Send a test SMS to your personal mobile number before broadcasting to parents.
- **Add Recipient**: Easily register new students to any class or section on the fly.
- **LocalStorage Persistence**: Student directory, templates, delivery logs, and SMS balance automatically persist across page reloads.
- **Iconic BSS Branding Ribbon**: Faithful bottom blue ribbon banner preserving the institutional aesthetic.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation & Run
```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the Vite development server
npm run dev

# 3. Open your browser
# Navigate to the local URL shown in your terminal (usually http://localhost:5173)
```

### Production Build
```bash
npm run build
npm run preview
```
