# AhmedPDF - Image & Text to PDF Converter

A modern, feature-rich web application for converting images and text to PDF documents. Built with HTML, Tailwind CSS, and JavaScript, featuring Arabic language support, user authentication, and analytics.

## 🌟 Features

### Core Functionality
- **Image to PDF**: Upload multiple images and convert them to PDF
- **Text to PDF**: Add text content with titles and convert to PDF
- **Drag & Drop**: Reorder content using drag and drop functionality
- **Arabic Support**: Full RTL support for Arabic text with custom fonts
- **Multi-language**: English and Arabic interface

### User Management
- **Authentication**: Email/password signup and login
- **User Profiles**: Customizable profiles with avatar and banner images
- **Profile Management**: Discord-style image cropping for avatars
- **Session Tracking**: Anonymous and authenticated usage tracking

### Analytics & Insights
- **Usage Analytics**: Track conversions, pages created, and user behavior
- **Admin Dashboard**: Comprehensive analytics for administrators
- **Export Data**: CSV export functionality for data analysis

### Payment Integration
- **Donation System**: Multiple payment methods including:
  - STC Pay SADAD (Saudi Arabia)
  - PayPal
  - Cryptocurrency (BTC, ETH, SOL, LTC, USDT)

## 🚀 Tech Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **PDF Generation**: jsPDF
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Fonts**: Inter (English), IBM Plex Sans Arabic (Arabic)

## 📋 Prerequisites

Before setting up this project, you'll need:

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Git**: For version control
3. **Web Browser**: Modern browser with JavaScript enabled

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ahmedpdf.git
cd ahmedpdf
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_project_url
API_KEY=your_supabase_anon_key
ADMIN_EMAIL=batawelofficial@gmail.com
```

### 3. Supabase Setup

1. **Create a new Supabase project**
2. **Set up the database tables** (see Database Schema section)
3. **Configure Row Level Security (RLS) policies**
4. **Set up Storage buckets** for user avatars and banners

### 4. Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create tables and policies
-- (See the SQL setup files for complete schema)
```

### 5. Local Development

For local development, you can use any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 🗄️ Database Schema

### Tables

1. **user_profiles**: User profile information
2. **usage_logs**: Application usage tracking
3. **donations**: Donation records

### Key Features

- **Row Level Security (RLS)**: Secure data access
- **Real-time subscriptions**: Live data updates
- **File storage**: User avatar and banner images

## 🌐 Deployment

### Vercel Deployment

1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables** in Vercel dashboard:
   - `SUPABASE_URL`
   - `API_KEY`
   - `ADMIN_EMAIL`

### Netlify Deployment

1. **Connect to Netlify**:
   - Drag and drop the project folder to Netlify
   - Or connect via Git

2. **Set Environment Variables** in Netlify dashboard

### Cloudflare Pages

1. **Connect to Cloudflare Pages**:
   - Connect your GitHub repository
   - Set build settings

2. **Set Environment Variables** in Cloudflare dashboard

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `API_KEY` | Your Supabase anon/public key | Yes |
| `ADMIN_EMAIL` | Admin email for analytics access | Yes |

### Customization

- **Branding**: Update the "AhmedPDF" name throughout the application
- **Colors**: Modify Tailwind CSS classes for custom theming
- **Fonts**: Replace font files in the `fonts/` directory
- **Payment Methods**: Update wallet addresses and payment links

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level security
- **Environment Variables**: Secure API key storage
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Built-in protection mechanisms

## 📊 Analytics & Monitoring

### Admin Dashboard Features

- **Real-time Statistics**: Live usage data
- **User Analytics**: Conversion tracking
- **Device Analytics**: Platform and browser statistics
- **Export Functionality**: CSV data export

### Access Control

- **Admin-only Access**: Restricted to specified email
- **User Privacy**: Individual user data protection
- **Anonymous Tracking**: Non-intrusive usage analytics

## 🌍 Internationalization

### Supported Languages

- **English**: Default language
- **Arabic**: Full RTL support with custom fonts

### Language Features

- **Dynamic Text Direction**: Automatic RTL/LTR switching
- **Arabic Fonts**: Custom IBM Plex Sans Arabic fonts
- **Localized Content**: Translated interface elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase**: Backend infrastructure
- **Tailwind CSS**: Styling framework
- **jsPDF**: PDF generation
- **Chart.js**: Data visualization
- **Font Awesome**: Icons

## 📞 Support

For support and questions:

- **Email**: batawelofficial@gmail.com
- **Issues**: Create an issue on GitHub
- **Documentation**: Check the inline code comments

## 🔄 Updates

Stay updated with the latest features and improvements by:

- **Watching** the repository on GitHub
- **Following** the release notes
- **Checking** the changelog

---

**Built with ❤️ by Ahmed** 