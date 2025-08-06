export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  const config = {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    API_KEY: process.env.SUPABASE_ANON_KEY || ''
  };
  
  res.status(200).send(`
    window.ENV = {
      SUPABASE_URL: '${config.SUPABASE_URL}',
      API_KEY: '${config.API_KEY}'
    };
  `);
} 