# 🚀 Deploy to Vercel - Step by Step Guide

Your League of Legends Analysis App is ready for deployment!

## Quick Deployment (5 minutes):

### 1. **Visit Vercel**
Go to: https://vercel.com

### 2. **Sign in with GitHub**
- Click "Continue with GitHub"
- Authorize Vercel to access your repositories

### 3. **Import Your Repository**
- Click "Add New..." → "Project"
- Search for: `AWS_Rift_Rewind`
- Click "Import"

### 4. **Configure Project**
- **Project Name**: `league-analysis-app` (or your choice)
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `web-app` ⚠️ **IMPORTANT**
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 5. **Add Environment Variables**
In the "Environment Variables" section, add these:

```
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
S3_DATASET_BUCKET=rift-rewind-dataset
S3_SUMMARIES_BUCKET=rift-rewind-summaries
BEDROCK_MODEL_ID=us.anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_REGION=us-east-1
RIOT_API_KEY=your_riot_api_key_here
```

### 6. **Deploy**
- Click "Deploy"
- Wait ~2-3 minutes for build completion
- Get your public URL! 🎉

## 🌐 Your Public URL will be:
```
https://league-analysis-app.vercel.app
```
(or similar based on your project name)

## 🧪 Test Your Deployment:
Once deployed, test with Ruler's data:
- Visit: `https://your-url.vercel.app/player/wyzXAysX728Q8ecHQ2zJ6gU-LAZohJR-n79hhE4ah8z4yphhQMdGPrWrCkgAZ4u6Tnj6mtFo75MJrw`
- Verify S3 data loading
- Test Claude analysis functionality

## 🔄 Automatic Updates:
Every time you push to GitHub `main` branch, Vercel automatically redeploys!

## 🎯 Features Available:
- ✅ Real League of Legends data (917 matches for Ruler)
- ✅ AI-powered insights via Claude 3.5 Sonnet
- ✅ Interactive charts and analytics  
- ✅ Player performance summaries
- ✅ Global CDN for fast loading
- ✅ SSL certificate (HTTPS)
- ✅ Mobile responsive design

Ready to deploy? Let's go! 🚀