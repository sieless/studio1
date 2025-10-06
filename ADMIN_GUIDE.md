# Admin Dashboard Guide

## Admin Access

**Admin Email:** `titwzmaihya@gmail.com`

Only the user logged in with this email address will have access to the admin dashboard.

## Accessing the Admin Dashboard

1. Log in with the admin email
2. Click on your profile avatar in the header
3. Select "Admin Dashboard" from the dropdown menu (marked in orange)
4. Alternatively, navigate directly to: `/admin`

## Admin Features

### 📊 Analytics Dashboard

The main dashboard provides real-time statistics:

- **Total Users** - Number of registered users with 7-day growth
- **Total Listings** - Number of active listings with 7-day growth
- **Vacant Properties** - Currently available properties
- **Top Location** - Most popular location with property count

Additional breakdowns:
- Listings by Type (Bedsitter, 1 Bedroom, etc.)
- Listings by Status (Vacant, Occupied, Available Soon)

### 👥 User Management

Features:
- **View all users** with email, name, listings count, join date, and status
- **Search users** by email or name
- **Suspend/Unsuspend users** - Prevents suspended users from posting
- **Delete users** - Permanently removes user and ALL their listings
- View user activity and statistics

Actions:
- Click "Suspend" to disable a user account
- Click "Unsuspend" to reactivate a suspended account
- Click "Delete" to permanently remove a user (requires confirmation)

### 🏠 Listings Management

Features:
- **View all listings** across the platform
- **Search listings** by name, location, or type
- **Filter by type** (Bedsitter, 1 Bedroom, Studio, etc.)
- **Filter by status** (Vacant, Occupied, Available Soon)
- **Update listing status** directly from the table
- **Delete listings** that violate policies
- **View listings** - Opens listing in new tab

Actions:
- Use the dropdowns to filter listings
- Change status using the status dropdown for each listing
- Click "View" to see the listing details
- Click "Delete" to remove inappropriate listings

## Admin Capabilities

### What Admins Can Do:
✅ View all users and their activity
✅ Suspend/unsuspend user accounts
✅ Delete user accounts (cascades to their listings)
✅ View all listings across the platform
✅ Update listing statuses
✅ Delete individual listings
✅ View platform-wide analytics
✅ Search and filter users/listings
✅ Monitor platform growth and trends

### Security Features:
🔒 Route protection - Non-admin users redirected to home
🔒 Email verification - Only specific admin email has access
🔒 Confirmation dialogs - Prevents accidental deletions
🔒 Activity tracking - All actions are logged in console

## Best Practices

1. **Before deleting a user:**
   - Check their listings count
   - Consider suspending first as a warning
   - Remember: Deletion is permanent and includes all listings

2. **Managing listings:**
   - Use filters to find problematic listings
   - Update status instead of deleting when possible
   - View listing before taking action

3. **Monitoring:**
   - Check analytics regularly
   - Monitor 7-day growth trends
   - Identify top locations for insights

## Navigation

The admin dashboard has two main tabs:
1. **Users Management** - Manage user accounts
2. **Listings Management** - Manage property listings

Switch between tabs to access different management features.

## Support

If you encounter any issues with the admin dashboard:
1. Check browser console for errors
2. Ensure you're logged in with the admin email
3. Verify Firebase permissions are correctly configured
4. Contact technical support if issues persist

---

**Note:** The admin dashboard is mobile-responsive and can be accessed from any device.
