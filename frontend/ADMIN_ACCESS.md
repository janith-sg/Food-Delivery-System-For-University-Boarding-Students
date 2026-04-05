# Admin & User Access Guide

## Overview
The application has two separate interfaces:
- **User Side**: For regular users to browse and order food items
- **Admin Side**: For administrators to manage food items, offers, and stock

---

## User Access

### Opening the User Side
**URL**: `http://localhost:5173/menu`

Users see:
- ✅ Food menu with browsing and filtering
- ✅ Add to cart functionality
- ✅ Product details
- ✅ Featured categories and special offers
- ✅ User View button
- ✅ Cart counter

Users don't see:
- ❌ Admin Panel button
- ❌ Add/Edit/Delete item options
- ❌ Stock management
- ❌ Offer management

---

## Admin Access

### Opening the Admin Side
**URL**: `http://localhost:5173/admin/menu`

Admins see:
- ✅ Admin Panel button
- ✅ Add new food item form with full details
- ✅ Edit existing food items
- ✅ Delete food items
- ✅ Manage limited time offers (add, edit, delete)
- ✅ Stock status display
- ✅ Refresh data option
- ✅ Advanced nutritional details for each item

Admins don't see:
- ❌ User View button (only Admin Panel button)
- ❌ Cart functionality
- ❌ "Add to Cart" buttons
- ❌ Cart counter

---

## Navigation Between Sides

### For Users
1. Users can browse the user menu at `http://localhost:5173/menu`
2. The interface shows a "User View" button for reference (stays on user side)
3. Users don't have access to admin controls

### For Admins
1. Admins access the admin panel directly at `http://localhost:5173/admin/menu`
2. The interface shows the "Admin Panel" button (stays on admin side)
3. To view the user experience, admins can:
   - Manually navigate to `http://localhost:5173/menu` in the address bar
   - OR open a new incognito/private window to test the user experience
   - Note: Once on the user side, admins cannot navigate back using the UI buttons

---

## Quick Access Bookmarks

Add these to your browser bookmarks:

**User Side:**
```
http://localhost:5173/menu
```

**Admin Side:**
```
http://localhost:5173/admin/menu
```

---

## Important Notes

- **Separation by Design**: Users and admins have completely separate interfaces to prevent accidental modifications
- **No Toggle**: The previous "Toggle Availability" button has been removed for a cleaner admin interface
- **Two Entry Points**: Always use the correct URL for each role
- **Session-less**: The application doesn't use sessions, so switching between user and admin modes requires changing the URL

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't find Admin Panel button | Make sure you're at `http://localhost:5173/admin/menu` (not `/menu`) |
| Can't find User View button after navigating | That's normal - users only see user controls, admins only see admin controls |
| Want to test both sides | Use different browser windows or incognito mode for each |

