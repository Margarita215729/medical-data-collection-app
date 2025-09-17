# ⚡ Quick Start - Deploy to Vercel in 5 Minutes

## 🚀 One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo-url)

## 📋 Prerequisites Checklist

- [ ] **Supabase Account** - Sign up at [supabase.com](https://supabase.com) (free)
- [ ] **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
- [ ] **GitHub Account** - For AI features (optional)

## ⚡ 5-Minute Setup

### Step 1: Create Supabase Project (2 min)
1. Go to [supabase.com](https://supabase.com) → "New Project"
2. Choose organization and name
3. Set password and region
4. Wait for initialization

### Step 2: Get Supabase Keys (1 min)
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (click "Reveal")

### Step 3: Deploy to Vercel (2 min)
1. Click the deploy button above or go to [vercel.com](https://vercel.com)
2. Import this repository
3. Add environment variables:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

4. Click "Deploy"

## ✅ Verify Deployment

1. **Visit your Vercel URL**
2. **Login with test account**:
   - Email: `doctor1@medical.com`
   - Password: `medical2024!`
3. **Test basic functionality**:
   - Add a patient
   - Fill medical forms
   - Export data

## 🤖 Add AI Features (Optional)

1. **Get GitHub Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token
   - Copy token

2. **Add to Vercel**:
   ```env
   GITHUB_TOKEN=your_github_token_here
   ```

3. **Test AI**:
   - Go to Patient Portal
   - Chat with AI assistant
   - Review recommendations in ML Dashboard

## 🏥 Medical Staff Accounts

The app comes with 4 test accounts:

| Email | Password | Role |
|-------|----------|------|
| doctor1@medical.com | medical2024! | Neurologist |
| doctor2@medical.com | medical2024! | Physical Therapist |
| doctor3@medical.com | medical2024! | Speech Therapist |
| doctor4@medical.com | medical2024! | Psychologist |

## 📱 Mobile Access

- Works on any device with web browser
- Optimized for tablets and smartphones
- PWA support for app-like experience

## 🆘 Quick Troubleshooting

**Can't connect to Supabase?**
- Verify URLs and keys are correct
- Check for extra spaces in environment variables

**Login not working?**
- Wait 30 seconds for server initialization
- Try refreshing the page

**AI features not working?**
- Add GITHUB_TOKEN environment variable
- Verify token has proper permissions

**Build failed?**
- Check all environment variables are set
- Review Vercel build logs

## 📞 Need Help?

1. Check the detailed [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review [README.md](./README.md) for full documentation
3. Contact your system administrator

---

**🎉 That's it!** Your medical application is now live and ready for use by healthcare professionals.