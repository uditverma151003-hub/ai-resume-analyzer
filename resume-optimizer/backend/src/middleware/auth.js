import { supabase } from '../services/supabaseClient.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Sign in to analyze your resume'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Sign in to analyze your resume'
    });
  }

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Supabase server configuration is missing.'
    });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Sign in to analyze your resume'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Sign in to analyze your resume'
    });
  }
}
