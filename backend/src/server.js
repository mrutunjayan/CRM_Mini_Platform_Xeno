import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const { MONGO_URI, JWT_SECRET } = process.env;
const PORT = Number(process.env.PORT || 5000);

if (!JWT_SECRET) throw new Error('JWT_SECRET is required. Add it to backend/.env.');
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
	throw new Error('PORT must be a number between 1 and 65535.');
}

await connectDB(MONGO_URI);
app.listen(PORT, () => console.log(`Mini CRM API listening on port ${PORT}`));