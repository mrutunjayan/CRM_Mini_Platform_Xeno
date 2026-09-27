import { Router } from 'express';
import mongoose from 'mongoose';
import Contact from '../models/Contact.js';
import Deal, { DEAL_STAGES } from '../models/Deal.js';
import { hasText, pick } from '../utils/validation.js';

const router = Router();
const dealFields = ['title', 'contact', 'value', 'stage', 'notes'];

function validateDeal(data, partial = false) {
  if ((!partial || data.title !== undefined) && (!hasText(data.title) || data.title.trim().length > 160)) {
    return 'Title is required and must be 160 characters or fewer.';
  }
  if ((!partial || data.contact !== undefined) && !mongoose.isValidObjectId(data.contact)) {
    return 'Choose a valid contact.';
  }
  if (data.value !== undefined && (!Number.isFinite(Number(data.value)) || Number(data.value) < 0)) {
    return 'Value must be a non-negative number.';
  }
  if (data.stage !== undefined && !DEAL_STAGES.includes(data.stage)) {
    return `Stage must be one of: ${DEAL_STAGES.join(', ')}.`;
  }
  if (data.notes !== undefined && (typeof data.notes !== 'string' || data.notes.length > 2000)) {
    return 'Notes must be text and 2000 characters or fewer.';
  }
  return null;
}

router.get('/', async (req, res) => {
  const deals = await Deal.find({ user: req.user.id })
    .populate('contact', 'name company email notes')
    .sort({ updatedAt: -1 });
  return res.json(deals);
});

router.post('/', async (req, res) => {
  const body = req.body || {};
  const error = validateDeal(body);
  if (error) return res.status(400).json({ message: error });
  const contact = await Contact.findOne({ _id: body.contact, user: req.user.id });
  if (!contact) return res.status(400).json({ message: 'Choose one of your contacts.' });

  const deal = await Deal.create({ ...pick(body, dealFields), user: req.user.id });
  await deal.populate('contact', 'name company email notes');
  return res.status(201).json(deal);
});

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid deal ID.' });
  const updates = pick(req.body || {}, dealFields);
  if (!Object.keys(updates).length) return res.status(400).json({ message: 'Provide at least one deal field to update.' });
  const error = validateDeal(updates, true);
  if (error) return res.status(400).json({ message: error });
  if (updates.contact && !await Contact.exists({ _id: updates.contact, user: req.user.id })) {
    return res.status(400).json({ message: 'Choose one of your contacts.' });
  }
  if (updates.title) updates.title = updates.title.trim();
  if (updates.value !== undefined) updates.value = Number(updates.value);

  const deal = await Deal.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id }, updates,
    { new: true, runValidators: true }
  ).populate('contact', 'name company email notes');
  if (!deal) return res.status(404).json({ message: 'Deal not found.' });
  return res.json(deal);
});

router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid deal ID.' });
  const deal = await Deal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!deal) return res.status(404).json({ message: 'Deal not found.' });
  return res.json({ message: 'Deal deleted.' });
});

export default router;