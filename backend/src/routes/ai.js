import { Router } from 'express';
import { generateFollowUpEmail } from '../services/geminiService.js';
import { hasText } from '../utils/validation.js';
import { DEAL_STAGES } from '../models/Deal.js';

const router = Router();

router.post('/follow-up', async (req, res) => {
  const { contactName, company = '', notes = '', dealTitle, dealStage } = req.body || {};
  if (!hasText(contactName) || contactName.length > 100 || !hasText(dealTitle) || dealTitle.length > 160) {
    return res.status(400).json({ message: 'Contact name and deal title are required.' });
  }
  if (![company, notes].every((value) => typeof value === 'string') || company.length > 120 || notes.length > 2000) {
    return res.status(400).json({ message: 'Company or notes are too long.' });
  }
  if (!DEAL_STAGES.includes(dealStage)) return res.status(400).json({ message: 'Choose a valid deal stage.' });

  const email = await generateFollowUpEmail({ contactName, company, notes, dealTitle, dealStage });
  return res.json({ email });
});

export default router;