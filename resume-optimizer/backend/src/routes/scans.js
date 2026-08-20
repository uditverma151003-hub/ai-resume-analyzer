import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../services/supabaseClient.js';

const router = express.Router();

router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('scans')
      .select('id, resume_filename, created_at, analysis_result')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Scans History Error]:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch scan history.'
      });
    }

    const history = (data || []).map(row => ({
      id: row.id,
      resume_filename: row.resume_filename || 'Resume',
      created_at: row.created_at,
      overallScore: row.analysis_result?.overallScore ?? null
    }));

    return res.status(200).json({
      success: true,
      history
    });
  } catch (err) {
    console.error('[Scans History Exception]:', err.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while fetching scan history.'
    });
  }
});

export default router;
