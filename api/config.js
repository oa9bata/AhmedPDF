export default function handler(req, res) {
  // Set proper headers for JavaScript content
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Return JavaScript code that sets window.ENV
  res.send(`
    window.ENV = {
      SUPABASE_URL: '${process.env.SUPABASE_URL || 'https://jrlbailragggxaiteclv.supabase.co'}',
      API_KEY: '${process.env.API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpybGJhaWxyYWdnZ3hhaXRlY2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTg0NDEsImV4cCI6MjA2OTg3NDQ0MX0.2_iWzgbeXSYMfIMflnOblF9k-L8JQRwBhSwGhAGPOCI'}',
      ADMIN_EMAIL: '${process.env.ADMIN_EMAIL || 'batawelofficial@gmail.com'}'
    };
  `);
} 