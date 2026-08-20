import { Schema, model, Document, Types } from 'mongoose';

export interface IHolding extends Document {
  userId: Types.ObjectId;
  symbol: string;
  quantity: number;
  averagePrice: number;
  updatedAt: Date;
}

const holdingSchema = new Schema<IHolding>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    averagePrice: {
      type: Number,
      required: true,
      min: [0, 'Average price cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
  }
);

// Create compound unique index on userId and symbol
holdingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Holding = model<IHolding>('Holding', holdingSchema);
