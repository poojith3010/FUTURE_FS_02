# CRM Lead Manager

A simple yet powerful CRM (Customer Relationship Management) system to manage client leads generated from website contact forms. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🎯 Features

### ✔️ Core Features
- **Lead Listing**: View all leads with name, email, source, and status
- **Lead Status Updates**: Track leads through stages (New → Contacted → Qualified → Converted → Lost)
- **Notes & Follow-ups**: Add and manage notes for each lead
- **Secure Admin Access**: JWT-based authentication with role management

### ✨ Additional Features
- **Dashboard Analytics**: View total leads, conversion rates, and statistics
- **Search & Filter**: Find leads quickly by name, email, or company
- **Responsive Design**: Works on desktop and mobile devices
- **Source Tracking**: Track where leads come from (website, referral, social media, etc.)
- **Public API**: Accept leads from external contact forms

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern UI library
- **React Router v6** - Client-side routing
- **React Icons** - Icon library
- **React Toastify** - Toast notifications
- **Axios** - HTTP client
- **CSS3** - Modern styling with CSS variables

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Database
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

## 📁 Project Structure

```
crm-lead-manager/
├── client/                     # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── components/         # Reusable components
│       │   ├── Layout.js
│       │   └── Layout.css
│       ├── context/            # React context
│       │   └── AuthContext.js
│       ├── pages/              # Page components
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Dashboard.js
│       │   ├── Leads.js
│       │   ├── LeadDetail.js
│       │   ├── AddLead.js
│       │   └── EditLead.js
│       ├── services/           # API services
│       │   ├── api.js
│       │   └── leadService.js
│       ├── App.js
│       ├── index.js
│       └── index.css
├── server/                     # Express backend
│   ├── config/
│   │   └── db.js              # Database config
│   ├── middleware/
│   │   └── auth.js            # Auth middleware
│   ├── models/
│   │   ├── Lead.js            # Lead model
│   │   └── User.js            # User model
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   └── leads.js           # Lead routes
│   └── index.js               # Server entry point
├── .env                       # Environment variables
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/crm-lead-manager.git
   cd crm-lead-manager
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

   Or use the shortcut:
   ```bash
   npm run install-all
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/crm-leads

   # JWT Secret (use a long random string in production)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Server Port
   PORT=5000

   # Node Environment
   NODE_ENV=development
   ```

5. **Start MongoDB**
   
   If using local MongoDB:
   ```bash
   mongod
   ```

6. **Run the application**

   Development mode (runs both server and client):
   ```bash
   npm run dev
   ```

   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

7. **Open in browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Leads (Protected Routes)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | Get all leads (with filters) |
| GET | `/api/leads/stats` | Get lead statistics |
| GET | `/api/leads/:id` | Get single lead |
| POST | `/api/leads` | Create new lead |
| PUT | `/api/leads/:id` | Update lead |
| PATCH | `/api/leads/:id/status` | Update lead status |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/:id/notes` | Add note to lead |
| DELETE | `/api/leads/:id/notes/:noteId` | Delete note |

### Public Endpoint
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leads/public` | Create lead from contact form (no auth) |

## 🔐 Authentication

The first user to register automatically becomes an **admin**. Subsequent users are assigned the **user** role.

### Login Credentials (after registration)
- Email: your@email.com
- Password: your-password (min 6 characters)

## 📊 Lead Statuses

| Status | Description |
|--------|-------------|
| **New** | Fresh lead, not yet contacted |
| **Contacted** | Initial contact has been made |
| **Qualified** | Lead is qualified and interested |
| **Converted** | Successfully converted to client |
| **Lost** | Lead is no longer interested |

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run server` | Start server with nodemon (dev) |
| `npm run client` | Start React client |
| `npm run dev` | Start both server and client |
| `npm run install-all` | Install all dependencies |
| `npm run build` | Build React app for production |

## 🌐 Deploying to Production

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crm-leads
JWT_SECRET=your-very-long-random-secret-key
PORT=5000
NODE_ENV=production
```

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Heroku**: Add Procfile with `web: node server/index.js`
- **Vercel/Netlify**: Deploy frontend, use separate backend hosting
- **DigitalOcean/AWS**: Use PM2 for process management

## 📝 Using the Public Lead API

To accept leads from external contact forms:

```javascript
// Example: Sending lead from a contact form
fetch('http://your-api.com/api/leads/public', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Acme Inc',
    message: 'Interested in your services',
    source: 'website'
  })
});
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Your Name
- GitHub: [@yourusername](https://github.com/yourusername)

---

## 🎓 Skills Gained

By building this project, you'll learn:

- ✅ **CRUD Operations**: Create, Read, Update, Delete data
- ✅ **Backend Integration**: Connect frontend to backend APIs
- ✅ **Database Management**: Work with MongoDB and Mongoose
- ✅ **Authentication**: Implement JWT-based auth
- ✅ **Business Workflows**: Understand how CRMs work
- ✅ **Full-Stack Development**: Build complete web applications

---

**Happy Coding! 🚀**
