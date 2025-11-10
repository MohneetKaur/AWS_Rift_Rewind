# 🎮 League of Legends Analysis Dashboard

A comprehensive League of Legends player performance analysis application built with **Next.js 14**, **AWS Services**, and **AI-powered insights** using Claude 3.5 Sonnet.

## 🌟 Features

- **📊 Player Analytics**: Comprehensive performance metrics and statistics
- **🤖 AI Insights**: Claude 3.5 Sonnet powered analysis, roasts, and coaching tips
- **📈 Interactive Charts**: Beautiful visualizations using Recharts
- **🔄 Real-time Data**: Live League of Legends match data from AWS S3
- **🎯 Advanced Metrics**: KDA analysis, champion performance, match history
- **📱 Responsive Design**: Works perfectly on desktop and mobile
- **⚡ Fast Loading**: Global CDN deployment with Vercel

## 🚀 Live Demo

**🌐 Public URL**: [Your deployed URL will appear here after deployment]

### Test with Real Data:
Visit: `/player/wyzXAysX728Q8ecHQ2zJ6gU-LAZohJR-n79hhE4ah8z4yphhQMdGPrWrCkgAZ4u6Tnj6mtFo75MJrw`
*(Professional player "Ruler" with 917+ matches analyzed)*

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Charts**: Recharts
- **UI Components**: Radix UI, Custom components
- **Backend**: Next.js API Routes
- **Data Storage**: AWS S3
- **AI Analysis**: AWS Bedrock (Claude 3.5 Sonnet)
- **Deployment**: Vercel
- **Analytics**: Real League of Legends match data

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS Account (for S3 and Bedrock access)
- Git

## ⚙️ Environment Variables

Create `.env.local` in the `web-app` directory:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# S3 Buckets
S3_DATASET_BUCKET=rift-rewind-dataset
S3_SUMMARIES_BUCKET=rift-rewind-summaries

# AWS Bedrock
BEDROCK_MODEL_ID=us.anthropic.claude-3-5-sonnet-20241022-v2:0
BEDROCK_REGION=us-east-1

# Optional: Riot API (for future features)
RIOT_API_KEY=your_riot_api_key
```

## 🚀 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohneetKaur/AWS_Rift_Rewind.git
   cd AWS_Rift_Rewind
   ```

2. **Navigate to web-app directory**
   ```bash
   cd web-app
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your AWS credentials
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open application**
   Visit: http://localhost:3000

## 📦 Production Deployment

### Deploy to Vercel (Recommended - FREE)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy League analysis app"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Visit: https://vercel.com
   - Connect your GitHub repository
   - Set **Root Directory** to `web-app`
   - Add environment variables
   - Deploy!

3. **Configuration**
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `web-app` 
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

## 🎯 Key Features Explained

### 🔍 Player Analysis
- **Performance Metrics**: KDA, Win Rate, CS/min, Vision Score
- **Champion Statistics**: Most played, highest win rate champions
- **Match History**: Recent games with detailed breakdowns
- **Rank Progression**: Visual timeline of ranking changes

### 🤖 AI-Powered Insights
- **Performance Insights**: Deep analysis of strengths and improvement areas
- **Roast Mode**: Humorous but constructive criticism of gameplay
- **Coaching Tips**: Professional-level advice for skill improvement

### 📊 Data Visualization
- **Interactive Charts**: Performance trends, champion statistics
- **Heatmaps**: Champion performance across different metrics
- **Timeline Graphs**: Rank progression and match performance over time

## 🏗️ Project Structure

```
web-app/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   │   ├── s3/           # S3 data fetching
│   │   └── claude-analysis/ # AI analysis endpoints
│   ├── player/[puuid]/   # Player profile pages
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # Base UI components
│   └── *.tsx            # Feature components
├── lib/                 # Utility functions
│   ├── bedrock-client.ts # Claude AI integration
│   └── utils.ts         # Helper functions
└── public/              # Static assets
```

## 🔧 API Endpoints

- `GET /api/s3/player` - Fetch player data from S3
- `POST /api/s3/direct-summary` - Get processed match summaries
- `POST /api/claude-analysis` - Generate AI insights
- `GET /api/s3/timeline` - Fetch match timeline data

## 🧪 Testing

Test the application with real professional player data:

**Ruler (T1 ADC)**
- PUUID: `wyzXAysX728Q8ecHQ2zJ6gU-LAZohJR-n79hhE4ah8z4yphhQMdGPrWrCkgAZ4u6Tnj6mtFo75MJrw`
- 917+ analyzed matches
- Real competitive data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Riot Games** for League of Legends API and game data
- **AWS** for cloud infrastructure and AI services
- **Vercel** for exceptional hosting platform
- **Next.js** for the amazing React framework

## 📞 Support

If you have any questions or run into issues:

1. Check the [deployment guide](VERCEL_DEPLOYMENT.md)
2. Review environment variable setup
3. Ensure AWS credentials have proper permissions
4. Open an issue on GitHub

---

**⚡ Built with passion for League of Legends and modern web technologies!**