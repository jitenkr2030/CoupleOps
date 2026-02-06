# CoupleOps - Fix Systems, Not People

<div align="center">
  <img src="public/logo.svg" alt="CoupleOps Logo" width="120" height="120">
  
  **Transform Your Relationship with Structured Systems**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)](https://tailwindcss.com/)
</div>

---

## 🎯 **Product Philosophy**

> **"CoupleOps does not try to fix people. It fixes systems, and systems fix fights."**

CoupleOps is a comprehensive relationship management platform that transforms how couples communicate, make decisions, and manage their shared lives through structured systems and clear processes.

---

## ✨ **Core Features (18/18 Implemented)**

### 👥 **Relationship Management**
- **Secure Authentication**: User signup/login with session management
- **Partner Invitation**: OTP-based partner pairing system
- **Profile Management**: Business roles and preferences
- **Mode Switching**: Business/Personal mode with topic filtering

### 🛡️ **Decision Authority**
- **Role Lock System**: Business role ownership and locking
- **Decision Categories**: Financial, operational, strategic, child-related
- **Timer-Based Locking**: Automatic decision locking after discussion period
- **Final Authority**: Clear decision ownership and execution

### 💰 **Financial Transparency**
- **Income/Expense Tracking**: Daily entry with categorization
- **Business vs Personal**: Transaction tagging and filtering
- **Child Expenses**: Education, health, and activity cost management
- **Real-time Balance**: Live financial summaries for both partners

### 🤖 **AI-Powered Conflict Resolution**
- **AI Referee**: Neutral conflict analysis using z-ai-web-dev-sdk
- **Dual Perspective**: Both partners input their viewpoints
- **Logic-Based Solutions**: Practical, unbiased recommendations
- **No Emotional Language**: Focus on systems, not feelings

### 👶 **Child Management**
- **Profile System**: Complete child information management
- **Calendar & Reminders**: School, exams, activities, fee due dates
- **Decision Authority**: Child-related decision categories and ownership
- **Expense Tracking**: Education and activity cost management

### 🚨 **Advanced Controls**
- **Communication Control**: Topic discussion limits and cooldowns
- **Emergency Override**: Time-limited overrides for genuine emergencies
- **Notification System**: Real-time alerts for all system events
- **Activity Logging**: Complete audit trail for transparency

---

## 🏗️ **Technical Architecture**

### **Frontend Stack**
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **State Management**: Zustand + TanStack Query
- **Authentication**: NextAuth.js v4

### **Backend Stack**
- **Database**: SQLite with Prisma ORM
- **API**: RESTful endpoints with comprehensive validation
- **Authentication**: NextAuth.js with secure sessions
- **Validation**: Zod schema validation
- **AI Integration**: z-ai-web-dev-sdk for conflict resolution

### **Infrastructure**
- **Deployment**: Production-ready with Vercel/Netlify support
- **Security**: Password hashing, session management, SQL injection prevention
- **Performance**: Optimized queries, component caching, lazy loading
- **Monitoring**: Activity logging, error tracking, analytics

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- Bun or npm
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/jitenkr2030/CoupleOps.git
   cd CoupleOps
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   DATABASE_URL="file:./db/custom.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   bun run db:push
   bun run db:generate
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 **Project Structure**

```
CoupleOps/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── partner/        # Partner management
│   │   │   ├── roles/          # Role management
│   │   │   ├── decisions/      # Decision authority
│   │   │   ├── finances/       # Financial tracking
│   │   │   ├── tasks/          # Task management
│   │   │   ├── children/       # Child management
│   │   │   ├── ai-referee/     # AI conflict resolution
│   │   │   ├── communication-control/ # Topic management
│   │   │   ├── notifications/  # Alert system
│   │   │   └── emergency-override/ # Emergency system
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main dashboard
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── dashboard/         # Dashboard components
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Prisma client
│   │   └── utils.ts           # Utility functions
│   └── hooks/                 # Custom React hooks
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
└── README.md
```

---

## 🗄️ **Database Schema**

The application uses 14 comprehensive Prisma models:

### **Core Models**
- **User**: Authentication and profile management
- **Role**: Business role ownership and locking
- **Decision**: Decision authority and timer system
- **Task**: Role-based task assignment and tracking
- **FinancialEntry**: Income/expense tracking
- **Child**: Children profile management
- **CalendarEvent**: Child scheduling and reminders

### **System Models**
- **CommunicationControl**: Topic discussion limits
- **AiRefereeSession**: AI conflict resolution
- **EmergencyOverride**: Emergency override system
- **Notification**: Alert and notification system
- **ActivityLog**: Audit trail and security
- **Subscription**: Billing and feature management

---

## 🔧 **Configuration**

### **Environment Variables**

```env
# Database
DATABASE_URL="file:./db/custom.db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional: External services
# EMAIL_FROM="noreply@coupleops.com"
# EMAIL_SERVER_HOST="smtp.gmail.com"
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER="your-email@gmail.com"
# EMAIL_SERVER_PASSWORD="your-app-password"
```

### **Database Setup**

The application uses SQLite for development. For production:

1. **PostgreSQL**: Update `DATABASE_URL` with PostgreSQL connection string
2. **Run migrations**: `bun run db:migrate`
3. **Seed data**: (Optional) Run seed script for sample data

---

## 🎨 **UI Components**

The application uses a comprehensive component library built with:

- **shadcn/ui**: Modern, accessible components
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Consistent iconography
- **Framer Motion**: Smooth animations and transitions

### **Key Components**
- Partner Management
- Role Management
- Communication Control
- Child Calendar
- Notification Center
- Emergency Override

---

## 🔐 **Security Features**

- **Authentication**: Secure session-based authentication
- **Authorization**: Role-based access control
- **Data Validation**: Comprehensive input validation with Zod
- **SQL Injection Prevention**: Parameterized queries with Prisma
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: NextAuth.js CSRF protection
- **Password Security**: bcrypt hashing with salt rounds

---

## 📊 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST/GET /api/auth/[...nextauth]` - NextAuth.js authentication

### **Partner Management**
- `POST /api/partner` - Send partner invitation
- `PUT /api/partner` - Accept partner invitation

### **Role Management**
- `GET /api/roles` - List user roles
- `POST /api/roles` - Create new role
- `PUT /api/roles/[id]` - Update role
- `DELETE /api/roles/[id]` - Delete role

### **Decision Authority**
- `GET /api/decisions` - List decisions
- `POST /api/decisions` - Create decision
- `PUT /api/decisions/[id]` - Update decision

### **Financial Management**
- `GET /api/finances` - List financial entries
- `POST /api/finances` - Add financial entry

### **Child Management**
- `GET /api/children` - List children
- `POST /api/children` - Add child
- `GET /api/children/[id]/calendar` - Child calendar events
- `POST /api/children/[id]/calendar` - Add calendar event

### **AI Referee**
- `GET /api/ai-referee` - List referee sessions
- `POST /api/ai-referee` - Create referee session

### **Communication Control**
- `GET /api/communication-control` - List controlled topics
- `POST /api/communication-control` - Add controlled topic
- `POST /api/communication-control/[id]` - Record discussion
- `PUT /api/communication-control/[id]` - Update topic status

### **Emergency Override**
- `GET /api/emergency-override` - List overrides
- `POST /api/emergency-override` - Create override

### **Notifications**
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/[id]` - Mark as read
- `DELETE /api/notifications/[id]` - Delete notification

---

## 🧪 **Testing**

The application includes comprehensive testing:

```bash
# Run linting
bun run lint

# Type checking
bun run type-check

# Database validation
bun run db:validate
```

---

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### **Docker**
```bash
# Build image
docker build -t coupleops .

# Run container
docker run -p 3000:3000 coupleops
```

### **Traditional Hosting**
```bash
# Build for production
bun run build

# Start production server
bun run start
```

---

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed
- Ensure code passes linting and type checking

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Next.js Team** - For the excellent framework
- **shadcn/ui** - For the beautiful component library
- **Prisma** - For the powerful ORM
- **Z.ai** - For the AI integration capabilities
- **Tailwind CSS** - For the utility-first CSS framework

---

## 📞 **Support**

- **Documentation**: [Full documentation](https://docs.coupleops.com)
- **Issues**: [GitHub Issues](https://github.com/jitenkr2030/CoupleOps/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jitenkr2030/CoupleOps/discussions)
- **Email**: support@coupleops.com

---

<div align="center">
  <strong>🚀 Transform Your Relationship Today</strong>
  
  Built with ❤️ for couples who believe in better systems
</div>