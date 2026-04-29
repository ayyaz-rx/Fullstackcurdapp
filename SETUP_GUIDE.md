# CURD System - Quick Setup Guide

## Prerequisites
- Node.js 18+
- MongoDB account (Atlas recommended)
- npm or yarn

## Installation Steps

### 1. Clone/Setup Project
```bash
cd curd-fullstack-project
npm install
```

### 2. Configure Environment
Create `.env.local` in project root:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/curd-db
```

### 3. Run Development Server
```bash
npm run dev
```

Server starts at: http://localhost:3000

## First Time Setup

### Step 1: Register a User
1. Go to http://localhost:3000/register
2. Fill in: Name, Email, Password
3. Submit - creates account with **viewer** role

### Step 2: Login
1. Go to http://localhost:3000/login
2. Use registered email/password
3. Redirected to dashboard

### Step 3: Create Admin User (for testing)
Option A: Via MongoDB directly
```javascript
// In MongoDB Atlas, update user document:
{ email: "your-email@example.com", role: "admin" }
```

Option B: Create another user, login, then promote via DB

### Step 4: Test Features
- **Viewer**: Can only read posts
- **Editor**: Can create & edit posts
- **Admin**: Can create/edit/delete posts AND manage users

## File Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── api/             # Backend API routes
│   │   ├── auth/        # Login, register, verify
│   │   ├── posts/       # Post CRUD operations
│   │   └── users/       # User management (admin only)
│   ├── posts/           # Posts pages (CRUD)
│   ├── users/           # User management (admin only)
│   └── dashbord/        # Main dashboard
├── components/          # Reusable UI components
├── lib/
│   ├── auth.ts         # JWT token utilities
│   ├── db.ts           # MongoDB connection
│   └── permission.ts   # Authorization checks
├── models/             # Database schemas
└── constants/          # Roles & permissions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify token

### Posts (CRUD)
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post (editor+)
- `GET /api/posts/[id]` - Get single post
- `PUT /api/posts/[id]` - Update post (editor+)
- `DELETE /api/posts/[id]` - Delete post (admin only)

### Users (Admin Only)
- `GET /api/users` - List all users
- `PUT /api/users/[id]/role` - Change user role

## Role-Based Permissions

| Feature | Viewer | Editor | Admin |
|---------|--------|--------|-------|
| Read Posts | ✅ | ✅ | ✅ |
| Create Posts | ❌ | ✅ | ✅ |
| Edit Own Posts | ❌ | ✅ | ✅ |
| Delete Posts | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |

## Performance Notes

### Login Speed
- **Database Connection**: Pooled (reused across requests)
- **Timeout Protection**: 10 seconds max
- **Response Time**: 100-500ms typical
- **Dashboard Load**: Instant (cached data) + background verification

### Caching Strategy
- User data cached in localStorage after login
- Token stored in localStorage
- Dashboard shows cached data immediately
- Server verifies token asynchronously

## Testing

### Manual Testing
1. Register as new user → creates "viewer" role
2. Try to create post → should be blocked
3. Promote to "editor" → can create posts
4. Promote to "admin" → can delete and manage users
5. Logout → localStorage cleared, redirected to login

### API Testing
Use Postman or cURL:
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'

# Get token from response, then use it:
curl -X GET http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Login Not Working
- Check `.env.local` has valid `MONGO_URI`
- Verify MongoDB connection is active
- Check browser console for errors

### Dashboard Shows Loading
- Verify token is stored in localStorage
- Check if server is running (`npm run dev`)
- Open browser DevTools to see API errors

### Can't See Users Page
- Make sure you're logged in as admin
- Check role in MongoDB (should be "admin")
- Refresh page if just promoted to admin

### Posts Not Showing
- Make sure posts exist in MongoDB
- Verify user role allows reading posts
- Check API response in Network tab

## Next Steps

1. **Add Input Validation** - Use Zod/Yup for form validation
2. **Add Rate Limiting** - Prevent brute force attacks
3. **Add Email Verification** - Confirm email on registration
4. **Add Password Reset** - Forgot password flow
5. **Add Search & Filter** - Find posts by title/content
6. **Add Pagination** - Load posts in pages
7. **Deploy to Production** - Use Vercel + MongoDB Atlas

## Support

For issues, check:
- Browser DevTools Console for client errors
- Server terminal for API errors
- MongoDB Atlas dashboard for database status
- Network tab to see API request/response

---

**Happy coding! 🚀**
