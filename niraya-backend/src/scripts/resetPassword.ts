import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/database';
import { User } from '../models/User';

// Usage: ts-node src/scripts/resetPassword.ts <email> <newPassword>
async function run() {
  dotenv.config();
  const email = process.argv[2];
  const newPassword = process.argv[3];
  if (!email || !newPassword) {
    console.error('Usage: ts-node src/scripts/resetPassword.ts <email> <newPassword>');
    process.exit(1);
  }
  await connectDB();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const user = await User.findOneAndUpdate(
    { email: String(email).toLowerCase() },
    { $set: { passwordHash } },
    { new: true }
  );
  if (!user) {
    console.error('User not found:', email);
    process.exit(2);
  }
  console.log('✅ Password reset for:', user.email);
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ resetPassword failed:', err);
  process.exit(1);
});
