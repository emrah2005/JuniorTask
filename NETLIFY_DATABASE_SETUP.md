# Complete Netlify + Free MySQL Database Setup

## Quick Start Guide

This guide will help you:
1. Set up a FREE MySQL database (Aiven.io - 1GB free forever)
2. Import your schema.sql
3. Connect to Netlify
4. Deploy your app

---

## Step 1: Create Free Database on Aiven.io

### Why Aiven?
- ✅ FREE forever (1GB storage, 1GB RAM)
- ✅ No credit card required
- ✅ Automatic backups
- ✅ SSL included
- ✅ Easy setup

### Setup Instructions:

**1. Sign up:** https://aiven.io/
   - Click "Start Free"
   - Use email or GitHub login
   - Verify your email

**2. Create MySQL Service:**
   - Click "Create Service"
   - Select **MySQL**
   - Choose **Free Plan** (scroll down to see it)
   - Select region closest to you
   - Name it: `booking-saas-db`
   - Click "Create Service"
   - ⏱️ Wait 5-10 minutes for setup

**3. Get Connection Details:**
   Once ready, click on your service:
   - Host: `yourservice.aivencloud.com`
   - Port: `XXXXX`
   - User: `avnadmin`
   - Password: (shown in dashboard)
   - Database: `defaultdb`

---

## Step 2: Import Schema

### Option A: Using Aiven Web Console (Easiest)

1. In Aiven dashboard, click your MySQL service
2. Go to "Query Editor" tab
3. Copy ALL content from `backend/database/schema.sql`
4. Paste into query editor
5. Click "Execute"
6. Verify tables created:
   ```sql
   SHOW TABLES;
   ```

You should see: users, businesses, services, bookings, groups, memberships, attendance

### Option B: Using MySQL Client

```bash
mysql -h yourservice.aivencloud.com \\
      -P XXXXX \\
      -u avnadmin \\
      -p defaultdb < backend/database/schema.sql
```

---

## Step 3: Configure Netlify

### 3.1 Add Environment Variables

1. Go to: https://app.netlify.com
2. Select your site: **juniortask**
3. **Site Settings** → **Environment Variables**
4. Add these variables:

```
DB_HOST=your-service.aivencloud.com
DB_PORT=12345
DB_USER=avnadmin
DB_PASSWORD=your-password-from-aiven
DB_NAME=defaultdb
JWT_SECRET=change-this-to-random-string
JWT_EXPIRE=24h
NODE_ENV=production
```

### 3.2 Update Connection Code for SSL

Aiven requires SSL. Your `server.js` should use:

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});
```

---

## Step 4: Deploy

### Automatic Deploy (GitHub Integration)

1. Push your code to GitHub (if not already done)
2. Netlify will automatically deploy
3. Check deploy logs in Netlify dashboard

### Manual Deploy

1. In Netlify: **Deploys** tab
2. Click **"Trigger deploy"**
3. Select **"Clear cache and deploy site"**
4. Wait for build to complete

---

## Step 5: Test Your App

1. Visit your Netlify URL: `https://juniortask.netlify.app`
2. Try to register a new account
3. Try to login
4. Create a business
5. Check database in Aiven:
   ```sql
   SELECT * FROM users;
   ```

---

## Troubleshooting

### "Connection refused" Error

**Check:**
- Database is running in Aiven (status: RUNNING)
- Environment variables are correct in Netlify
- No typos in DB_HOST, DB_PORT

### "SSL required" Error

**Solution:** Add SSL config to your connection:
```javascript
ssl: { rejectUnauthorized: true }
```

### "Table doesn't exist" Error

**Solution:** Re-run schema.sql in Aiven Query Editor

### Check Logs

**Netlify Logs:**
- Deploys tab → Click latest deploy → View logs

**Aiven Logs:**
- Your service → Logs tab

---

## Free Database Limitations

**Aiven Free Tier:**
- 1 GB storage
- 1 GB RAM
- 5-10 concurrent connections
- Single node (no high availability)

**Good for:**
- ✅ Development
- ✅ Testing
- ✅ Small projects
- ✅ Prototypes
- ✅ Learning

**Not suitable for:**
- ❌ Large production apps
- ❌ High traffic sites
- ❌ Critical business apps

---

## Complete Checklist

- [ ] Created Aiven account
- [ ] Created MySQL service (free plan)
- [ ] Imported schema.sql
- [ ] Verified tables created
- [ ] Added environment variables to Netlify
- [ ] Updated server.js with SSL config
- [ ] Deployed to Netlify
- [ ] Tested user registration
- [ ] Tested user login
- [ ] Verified data in database

---

## Your Current Setup

**Frontend:** Netlify (React + Vite)
**Backend:** Netlify Functions or Express server
**Database:** Aiven.io MySQL (free 1GB)
**Code:** GitHub repository

**Live URL:** https://juniortask.netlify.app

---

## Support

If you need help:
1. Check Netlify deploy logs
2. Check Aiven service status
3. Verify all environment variables
4. Test database connection using MySQL client
5. Check browser console for errors

---

## Upgrade Path

When you need more:

**Aiven Paid Plans:**
- Starts at $8/month
- More storage, RAM, connections
- High availability
- Better performance

**Alternative Hosts:**
- Railway.app ($5 credit/month)
- DigitalOcean ($200 free credits)
- AWS RDS (pay as you go)

Your app is production-ready! 🚀
