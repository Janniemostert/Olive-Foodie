# Olive Foodie — Project Summary

## Overview
A Next.js 14 full-stack recipe and food blog app with admin panel, Google OAuth login, Cloudinary image uploads, and MongoDB storage. Built for a client with an olive green / cream colour scheme.

- **Live URL**: https://olivefoodie.netlify.app
- **GitHub**: https://github.com/Janniemostert/Olive-Foodie
- **Framework**: Next.js 14 (App Router)
- **Deployment**: Netlify (`@netlify/plugin-nextjs`)

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, CSS Modules |
| Auth | NextAuth v4, Google OAuth provider |
| Database | MongoDB Atlas (via Mongoose) |
| Images | Cloudinary |
| Local DB | SQLite (`meals.db`) — legacy meals only |
| Deployment | Netlify |

---

## Colour Palette
| Name | Hex |
|---|---|
| Cream / background | `#FDF6E1` |
| Darkest green (nav) | `#1e2a00` |
| Dark green (hover / headings) | `#3a4a02` |
| Mid olive (accents) | `#5F7103` |
| Light olive (gradient top) | `#8A9E1A` |
| Pale green (dates on dark) | `#d4e0a0` |

Card gradient: `linear-gradient(180deg, #8A9E1A 0%, #5F7103 40%, #3a4a02 100%)`  
Font: **Montserrat** (Google Fonts)

---

## Environment Variables
Set in Netlify → Environment Variables and locally in `.env.local`:

```
MONGODB_URI=           # MongoDB Atlas connection string
CLOUDNAME=             # Cloudinary cloud name
CLOUDAPIKEY=           # Cloudinary API key
CLOUDINARYSECRET=      # Cloudinary API secret
GOOGLE_CLIENT_ID=      # Google OAuth client ID
GOOGLE_CLIENT_SECRET=  # Google OAuth client secret
NEXTAUTH_SECRET=       # Random secret string (32+ chars)
NEXTAUTH_URL=          # http://localhost:3000 locally / https://olivefoodie.netlify.app on Netlify
ADMIN_EMAILS=          # Comma-separated list of admin Gmail addresses
```

---

## Admin Access
Admin role is assigned automatically on first login if the user's Google email matches any value in `ADMIN_EMAILS`.  
To add an admin: add their Gmail to `ADMIN_EMAILS` in Netlify env vars (comma-separated, no spaces).  
Example: `janniecmostert@gmail.com,clientemail@gmail.com`

**Note**: This only applies to NEW users on first sign-in. If a user already exists in MongoDB with `role: subscriber`, you must manually update their role in MongoDB Atlas to `admin`.

---

## Key File Structure
```
app/
  layout.js              # Root layout — Header + Footer + Providers
  page.js                # Home page (slideshow + hero)
  meals/                 # Recipe pages (SQLite backed)
  posts/                 # Blog/tips pages (MongoDB backed)
  admin/                 # Admin panel (role-protected)
  api/auth/[...nextauth] # NextAuth route
  components/
    header/              # Header, nav, auth bar, mobile menu
    footer/              # Footer
    meals/               # Meal cards, image picker, form submit
    comments/            # Comments component
lib/
  db.js                  # MongoDB connection
  meals.js               # SQLite meal queries
  actions.js             # Meal server actions
  postActions.js         # Post server actions (Cloudinary upload)
  commentActions.js      # Comment server actions
  models/                # Mongoose models: User, Post, Comment, Meal, Ingredient
```

---

## Header Layout (Responsive)
- **Mobile** (`<768px`): Logo left, hamburger right. Full-screen olive drawer with nav + auth.
- **Tablet** (`768px+`): Top auth bar (full width, right-aligned) + logo left / nav right row below.
- **Desktop** (`1024px+`): Same two-row layout, slightly larger logo.

---

## Google OAuth Setup (required for new domains)
In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → **Weight Tracker** OAuth client:

Add to **Authorised JavaScript origins**:
```
https://olivefoodie.netlify.app
```

Add to **Authorised redirect URIs**:
```
https://olivefoodie.netlify.app/api/auth/callback/google
```

---

## Local Development
```bash
npm install
npm run dev     # http://localhost:3000
```
Requires `.env.local` with all variables above.

---

## Deploying Changes
```bash
git add .
git commit -m "your message"
git push
```
Netlify auto-deploys on every push to `main`.
