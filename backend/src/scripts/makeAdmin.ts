import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { User } from '../models/User';

// Usage: ts-node src/scripts/makeAdmin.ts user@example.com
async function run() {
  dotenv.config();
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: ts-node src/scripts/makeAdmin.ts <email>');
    process.exit(1);
  }
  await connectDB();
  const user = await User.findOneAndUpdate({ email: String(email).toLowerCase() }, { $set: { role: 'admin' } }, { new: true });
  if (!user) {
    console.error('User not found:', email);
    process.exit(2);
  }
  console.log('✅ Promoted to admin:', user.email);
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ makeAdmin failed:', err);
  process.exit(1);
});
