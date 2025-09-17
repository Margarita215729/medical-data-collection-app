# MedData ML - Concussion Rehabilitation Data Collection

Professional medical application for collecting concussion rehabilitation data for ML model training with AI-powered patient recommendations.

## 🏥 Features

- **Medical Staff Dashboard**: Secure login for 4 predefined medical accounts
- **Patient Data Collection**: PCSS, VOMS, DHI, HIT-6, PHQ-9, GAD-7 assessment scales
- **Rehabilitation Tracking**: 8 rehabilitation areas with progress monitoring
- **AI-Powered Recommendations**: GitHub Models API integration with doctor review system
- **Patient Portal**: Interactive chat with ML model for treatment recommendations
- **Privacy Compliance**: Separated patient identity and medical data storage
- **Mobile Optimized**: Full responsive design for mobile medical workflows
- **Data Export**: CSV export for ML model training
- **Learning System**: AI model improves based on doctor feedback

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/meddata-ml-app)

### 1. Environment Variables Setup

In your Vercel project dashboard, add these environment variables:

#### Required Supabase Variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://your-db-connection-string
```

#### Optional AI Features:
```
GITHUB_TOKEN=your-github-personal-access-token
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and API keys from Settings > API
3. The application will automatically create the required `kv_store_094289b0` table
4. Medical staff accounts will be auto-created on first server start

### 3. GitHub Models Setup (Optional)

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Create a new token with appropriate permissions
3. Add it as `GITHUB_TOKEN` environment variable in Vercel

## 🏥 Medical Staff Login

The application comes with 4 predefined medical staff accounts:

- **doctor1@medical.com** / medical2024! (Dr. Johnson - Neurologist)
- **doctor2@medical.com** / medical2024! (Dr. Williams - Physical Therapist)  
- **doctor3@medical.com** / medical2024! (Dr. Brown - Speech Therapist)
- **doctor4@medical.com** / medical2024! (Dr. Davis - Psychologist)

## 📱 Mobile Support

- Fully responsive design optimized for tablets and smartphones
- Touch-friendly interface with proper tap targets
- Mobile-first form layouts for data collection
- iOS/Android PWA support

## 🔒 Privacy & Security

- **Medical Data Separation**: Patient names stored separately from medical data
- **Anonymous Identifiers**: Each patient gets a unique anonymous ID
- **HIPAA Considerations**: Designed with medical privacy in mind
- **Secure Authentication**: Supabase-based user management
- **Data Export**: Only anonymized data in CSV exports

## 🤖 AI Features

- **GitHub Models Integration**: GPT-4o for medical analysis
- **Doctor Review System**: All AI recommendations require medical approval
- **Learning Feedback Loop**: AI improves based on doctor corrections
- **Patient Chat Interface**: Interactive treatment guidance
- **Daily Questionnaires**: AI-generated personalized check-ins

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Data Collection Scales

### Assessment Tools
- **PCSS**: Post-Concussion Symptom Scale (22 symptoms, 0-6 scale)
- **VOMS**: Vestibular/Ocular Motor Screening
- **DHI**: Dizziness Handicap Inventory
- **HIT-6**: Headache Impact Test
- **PHQ-9**: Depression screening
- **GAD-7**: Anxiety screening

### Rehabilitation Areas
1. Vestibular rehabilitation
2. Visual/oculomotor therapy
3. Headache management
4. Auditory processing
5. Speech/language therapy
6. Exertional therapy
7. Cervical spine therapy
8. Overall cognitive function

## 🔄 ML Training Workflow

1. **Data Collection**: Medical staff collect patient assessments
2. **AI Analysis**: GitHub Models analyze symptoms and generate recommendations
3. **Doctor Review**: Medical professionals approve/modify AI suggestions
4. **Feedback Learning**: System learns from doctor corrections
5. **Model Improvement**: AI recommendations become more accurate over time
6. **Data Export**: Anonymized data exported for external ML training

## 📞 Support

For technical support or medical workflow questions, please contact your system administrator.

## 📄 License

This medical application is proprietary software designed for healthcare professionals.

---

**⚠️ Medical Disclaimer**: This application is designed to assist healthcare professionals in data collection and treatment planning. All AI-generated recommendations must be reviewed and approved by qualified medical personnel before implementation.