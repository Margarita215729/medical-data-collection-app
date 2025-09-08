# 🚀 Deployment Guide for MedData ML

## Deploying to Vercel

### Prerequisites
1. [Vercel Account](https://vercel.com) (free tier available)
2. [Supabase Project](https://supabase.com) (free tier available)  
3. [GitHub Account](https://github.com) (for optional AI features)

### Step 1: Prepare Repository

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/meddata-ml-app.git
   git push -u origin main
   ```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for project initialization (2-3 minutes)
3. Go to Settings > API and copy:
   - Project URL (https://your-project.supabase.co)
   - anon/public key
   - service_role key (from service_role section)

### Step 3: Deploy to Vercel

1. **Connect Repository to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select framework: "Vite"

2. **Configure Environment Variables**:
   In Vercel project settings, add these environment variables:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
   ```

3. **Optional - Add GitHub Models API**:
   ```
   GITHUB_TOKEN=your-github-personal-access-token
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build completion (2-5 minutes)

### Step 4: Verify Deployment

1. **Test Application**:
   - Visit your Vercel deployment URL
   - Application should show Supabase connection screen or login

2. **Configure Supabase**:
   - If first time: Enter your Supabase credentials in the app
   - Application will auto-create required database tables

3. **Test Medical Staff Login**:
   - Use any of the predefined accounts:
     - doctor1@medical.com / medical2024!
     - doctor2@medical.com / medical2024!
     - doctor3@medical.com / medical2024!
     - doctor4@medical.com / medical2024!

### Step 5: Configure Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Configure DNS records as instructed

## Environment Variables Reference

### Required for Basic Functionality
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public anon key from Supabase
- `SUPABASE_URL`: Same as above (for server functions)
- `SUPABASE_ANON_KEY`: Same as above (for server functions)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations
- `SUPABASE_DB_URL`: PostgreSQL connection string

### Optional for AI Features
- `GITHUB_TOKEN`: Personal access token for GitHub Models API

## Troubleshooting

### Build Errors
- **"Cannot resolve module"**: Check all dependencies in package.json
- **TypeScript errors**: Run `npm run type-check` locally first
- **Tailwind build issues**: Verify tailwind.config.ts

### Runtime Errors
- **Supabase connection failed**: Verify environment variables
- **"User does not exist"**: Wait for server initialization, medical accounts auto-create
- **CORS errors**: Check Vercel functions configuration

### Performance Issues
- **Slow loading**: Check bundle size in build output
- **Memory limits**: Consider upgrading Vercel plan for larger datasets

## Production Checklist

- [ ] All environment variables configured
- [ ] Supabase project created and configured  
- [ ] Medical staff accounts can login
- [ ] Patient data forms work correctly
- [ ] AI recommendations system functional
- [ ] CSV export working
- [ ] Mobile interface responsive
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Error monitoring configured
- [ ] Backup strategy in place

## Security Notes

- Environment variables are automatically encrypted by Vercel
- Supabase handles authentication and row-level security
- Medical data is anonymized in exports
- HTTPS is enforced for all connections
- No sensitive data in client-side code

## Monitoring & Maintenance

1. **Vercel Analytics**: Enable in project settings
2. **Supabase Logs**: Monitor in Supabase dashboard
3. **Error Tracking**: Check Vercel Functions logs
4. **Database Usage**: Monitor Supabase quotas
5. **Regular Backups**: Configure Supabase backups

---

**🏥 Need Help?** This application is designed for healthcare professionals. For technical support, ensure you have proper credentials and access permissions for your medical facility.