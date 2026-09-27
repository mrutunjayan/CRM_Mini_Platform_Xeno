import { Router } from 'express';
import mongoose from 'mongoose';
import Contact from '../models/Contact.js';
import Deal from '../models/Deal.js';
import { hasText, isValidEmail, pick } from '../utils/validation.js';

const router = Router();
const contactFields = ['name', 'email', 'phone', 'company', 'notes'];

function validateContact(data, partial = false) {
  if ((!partial || data.name !== undefined) && (!hasText(data.name) || data.name.trim().length > 100)) {
    return 'Name is required and must be 100 characters or fewer.';
  }
  if ((!partial || data.email !== undefined) && !isValidEmail(data.email)) {
    return 'Enter a valid email address.';
  }
  for (const field of ['phone', 'company', 'notes']) {
    if (data[field] !== undefined && typeof data[field] !== 'string') return `${field} must be text.`;
  }
  if (data.phone?.length > 40) return 'Phone must be 40 characters or fewer.';
  if (data.company?.length > 120) return 'Company must be 120 characters or fewer.';
  if (data.notes?.length > 2000) return 'Notes must be 2000 characters or fewer.';
  return null;
}

router.get('/', async (req, res) => {
  const contacts = await Contact.find({ user: req.user.id }).sort({ name: 1 });
  return res.json(contacts);
});

router.post('/', async (req, res) => {
  const body = req.body || {};
  const error = validateContact(body);
  if (error) return res.status(400).json({ message: error });

  const contact = await Contact.create({ ...pick(body, contactFields), user: req.user.id });
  return res.status(201).json(contact);
});

router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid contact ID.' });
  const updates = pick(req.body || {}, contactFields);
  if (!Object.keys(updates).length) return res.status(400).json({ message: 'Provide at least one contact field to update.' });
  const error = validateContact(updates, true);
  if (error) return res.status(400).json({ message: error });
  if (updates.name) updates.name = updates.name.trim();
  if (updates.email) updates.email = updates.email.trim().toLowerCase();

  const contact = await Contact.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id }, updates,
    { new: true, runValidators: true }
  );
  if (!contact) return res.status(404).json({ message: 'Contact not found.' });
  return res.json(contact);
});

router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid contact ID.' });
  const contact = await Contact.findOne({ _id: req.params.id, user: req.user.id });
  if (!contact) return res.status(404).json({ message: 'Contact not found.' });
  if (await Deal.exists({ contact: contact._id, user: req.user.id })) {
    return res.status(409).json({ message: 'Move or delete this contact’s deals before deleting the contact.' });
  }
  await contact.deleteOne();
  return res.json({ message: 'Contact deleted.' });
});

export default router;