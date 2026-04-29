# 📊 Terminal Logging Guide - User Activity Monitoring

## Overview
Your CURD system now displays detailed logging in the terminal whenever users perform actions. You can see:
- **Who logged in** (email, ID, role)
- **What permissions they have**
- **What actions they performed** (create, update, delete posts)
- **Who they are** (name, email, role)
- **When they did it** (timestamp)

---

## 🟢 Login Logging

### What You'll See When User Logs In
```
✅ LOGIN SUCCESSFUL
────────────────────────────────────────────────────────────
Timestamp: 4/22/2026, 10:30:45 AM
User ID: 507f1f77bcf86cd799439011
Email: ali@example.com
Role: ADMIN
Created At: 4/20/2026, 3:15:22 PM
Permissions:
  ➕ create:post
  📖 read:post
  ✏️  update:post
  🗑️  delete:post
  👤 manage:users
  👤 manage:roles
────────────────────────────────────────────────────────────
```

### Failed Login Attempts
```
❌ Login Failed: User not found - invalid@example.com
❌ Login Failed: Invalid password for ali@example.com
```

---

## 🆕 Registration Logging

### What You'll See When New User Registers
```
✅ NEW USER REGISTERED
────────────────────────────────────────────────────────────
Timestamp: 4/22/2026, 10:32:10 AM
User ID: 607f1f77bcf86cd799439012
Name: Ahmed Khan
Email: ahmed@example.com
Role: VIEWER (default)
────────────────────────────────────────────────────────────
```

### Duplicate Email Error
```
⚠️  Registration Failed: Email already exists - ali@example.com
```

---

## 📝 Post Creation Logging

### What You'll See When User Creates a Post
```
📝 NEW POST CREATED
────────────────────────────────────────────────────────────
Timestamp: 4/22/2026, 10:35:20 AM
Post ID: 707f1f77bcf86cd799439013
Author: ali@example.com
Author Role: ADMIN
Title: My First Blog Post
Content Length: 245 characters
────────────────────────────────────────────────────────────
```

### Permission Denied
```
❌ Post Creation Failed: Permission denied for viewer@example.com
```

---

## ✏️ Post Update Logging

### What You'll See When User Updates a Post
```
✏️  POST UPDATED
────────────────────────────────────────────────────────────
Timestamp: 4/22/2026, 10:38:45 AM
Post ID: 707f1f77bcf86cd799439013
Updated By: ali@example.com
User Role: ADMIN
New Title: Updated Blog Post Title
────────────────────────────────────────────────────────────
```

---

## 🗑️ Post Deletion Logging

### What You'll See When User Deletes a Post
```
🗑️  POST DELETED
────────────────────────────────────────────────────────────
Timestamp: 4/22/2026, 10:40:15 AM
Post ID: 707f1f77bcf86cd799439013
Deleted By: ali@example.com
User Role: ADMIN
Original Title: Updated Blog Post Title
Original Author: ali@example.com
────────────────────────────────────────────────────────────
```

---

## 👤 User Role Change Logging

### What You'll See When Admin Changes User Role
```
👤 USER ROLE CHANGED
────────────────────────────────────────────────────────────
Timestamp: 4/22/2026, 10:42:30 AM
Changed By: admin@example.com (ADMIN)
Target User: ahmed@example.com
Old Role: VIEWER → EDITOR (New)
New Permissions:
  ➕ create:post
  📖 read:post
  ✏️  update:post
────────────────────────────────────────────────────────────
```

---

## 🎨 Terminal Colors & Emojis

### Color Codes Used
- 🟢 **Green** - Success messages (login, registration, post created)
- 🟡 **Yellow** - Warning/Failed attempts
- 🔵 **Blue** - Post operations (create, update)
- 🔴 **Red** - Deletions
- 🟣 **Magenta** - Roles and role changes
- 🔵 **Cyan** - Dividers/separators

### Permission Icons
- `➕` Create operations
- `📖` Read operations
- `✏️` Update operations
- `🗑️` Delete operations
- `👤` User/Role management

---

## 📋 Role & Permission Reference

### Roles
```
ADMIN   - Full access to everything
EDITOR  - Can create, read, and update posts
VIEWER  - Can only read posts
```

### Permissions by Role
```
ADMIN:
  ➕ create:post      - Create new posts
  📖 read:post        - Read all posts
  ✏️  update:post      - Edit any post
  🗑️  delete:post      - Delete any post
  👤 manage:users     - Change user roles
  👤 manage:roles     - Manage roles

EDITOR:
  ➕ create:post      - Create new posts
  📖 read:post        - Read all posts
  ✏️  update:post      - Edit their own posts

VIEWER:
  📖 read:post        - Read all posts only
```

---

## 🧪 Testing the Logging

### Step 1: Start Dev Server
```bash
npm run dev
```
Should see: `✓ Ready in XXXms`

### Step 2: Register a New User
1. Go to http://localhost:3000/register
2. Enter: Name, Email, Password
3. Submit

**Terminal should show:**
```
✅ NEW USER REGISTERED
...user details...
```

### Step 3: Login with the User
1. Go to http://localhost:3000/login
2. Enter Email and Password
3. Submit

**Terminal should show:**
```
✅ LOGIN SUCCESSFUL
User ID: ...
Email: ...
Role: VIEWER
Permissions:
  📖 read:post
```

### Step 4: Try to Create a Post (Will Fail)
1. Go to http://localhost:3000/posts/create
2. Fill in title and content
3. Submit

**Terminal should show:**
```
❌ Post Creation Failed: Permission denied
```

### Step 5: Change User Role to EDITOR
1. Login as ADMIN user
2. Go to http://localhost:3000/users
3. Change the user role to EDITOR
4. Submit

**Terminal should show:**
```
👤 USER ROLE CHANGED
Old Role: VIEWER → EDITOR
New Permissions:
  ➕ create:post
  📖 read:post
  ✏️  update:post
```

### Step 6: Create a Post (Now Succeed)
1. Login as the EDITOR user again
2. Go to http://localhost:3000/posts/create
3. Fill in title and content
4. Submit

**Terminal should show:**
```
📝 NEW POST CREATED
Author: user@example.com
Author Role: EDITOR
```

---

## 🛠️ Implementation Details

### Files Modified
1. **src/app/api/auth/login/route.tsx**
   - Added detailed login success logging
   - Shows user info and permissions
   - Logs failed login attempts

2. **src/app/api/auth/register/route.tsx**
   - Logs new user registration
   - Shows user role (default: viewer)

3. **src/app/api/posts/route.tsx**
   - Logs post creation
   - Shows author info and post details

4. **src/app/api/posts/[id]/route.ts**
   - Logs post updates
   - Logs post deletions
   - Shows who performed the action

5. **src/app/api/users/[id]/role/route.ts**
   - Logs role changes
   - Shows old and new roles
   - Displays new permissions

---

## 📊 Sample Terminal Session

```
PS F:\Revnix\curd\curd-fullstack-project> npm run dev

▲ Next.js 16.2.4 (Turbopack)
- Local:         http://localhost:3000
✓ Ready in 1200ms

✅ NEW USER REGISTERED
────────────────────────────────────────────────────────────
Timestamp: 4/22/2026, 10:30:00 AM
User ID: 507f1f77bcf86cd799439011
Name: Ali Ahmed
Email: ali@example.com
Role: VIEWER (default)
────────────────────────────────────────────────────────────

✅ LOGIN SUCCESSFUL
────────────────────────────────────────────────────────────
Timestamp: 4/22/2026, 10:30:45 AM
User ID: 507f1f77bcf86cd799439011
Email: ali@example.com
Role: VIEWER
Created At: 4/22/2026, 10:30:00 AM
Permissions:
  📖 read:post
────────────────────────────────────────────────────────────

❌ Post Creation Failed: Permission denied

👤 USER ROLE CHANGED
────────────────────────────────────────────────────────────
Timestamp: 4/22/2026, 10:32:10 AM
Changed By: admin@example.com (ADMIN)
Target User: ali@example.com
Old Role: VIEWER → EDITOR (New)
New Permissions:
  ➕ create:post
  📖 read:post
  ✏️  update:post
────────────────────────────────────────────────────────────

📝 NEW POST CREATED
────────────────────────────────────────────────────────────
Timestamp: 4/22/2026, 10:33:20 AM
Post ID: 607f1f77bcf86cd799439012
Author: ali@example.com
Author Role: EDITOR
Title: Learning Next.js
Content Length: 450 characters
────────────────────────────────────────────────────────────
```

---

## 🎯 Key Benefits

✅ **User Activity Tracking** - See who did what and when  
✅ **Permission Monitoring** - Know who has which permissions  
✅ **Security Auditing** - Track failed login attempts  
✅ **Debugging** - Quickly identify issues  
✅ **Role Management** - Monitor role changes  

---

## 📝 Notes

- All timestamps are in **Pakistan Standard Time (PKT)**
- Color codes work in most modern terminals (Windows 10+, Mac, Linux)
- Logging happens on **successful operations** and **failed attempts**
- User IDs are MongoDB ObjectIds
- The `name` field is only available for registered users (shown at registration)

---

## ❓ Troubleshooting

### Colors Not Showing
- If colors don't appear, your terminal might not support ANSI codes
- Try using Windows Terminal instead of cmd/PowerShell
- Or run in WSL (Windows Subsystem for Linux)

### Logging Not Appearing
- Make sure you're running `npm run dev` (not `npm run build`)
- Check that logging statements haven't been disabled
- Verify your MongoDB connection is working

### No Permission Details
- Make sure ROLE_PERMISSIONS are properly defined in `/src/constants/roles.ts`
- Verify the user's role is set correctly in the database

---

**Now you can monitor all user activities in your terminal! 🎉**
