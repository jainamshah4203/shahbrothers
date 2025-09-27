import mongoose, { Schema, Document } from 'mongoose';

export interface ICounter extends Document {
  key: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  key: { type: String, required: true, unique: true, index: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.models.Counter || mongoose.model<ICounter>('Counter', CounterSchema);

export async function nextSequence(key: string): Promise<number> {
  const updated = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return updated!.seq;
}
