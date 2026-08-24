import { Schema, model, Document, Types } from 'mongoose';

export interface IPendingOrder extends Document {
  userId: Types.ObjectId;
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'LIMIT' | 'STOP_LOSS';
  quantity: number;
  triggerPrice: number;
  createdAt: Date;
}

const pendingOrderSchema = new Schema<IPendingOrder>(
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
    type: {
      type: String,
      required: true,
      enum: ['BUY', 'SELL'],
    },
    orderType: {
      type: String,
      required: true,
      enum: ['LIMIT', 'STOP_LOSS'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    triggerPrice: {
      type: Number,
      required: true,
      min: [0, 'Trigger price cannot be negative'],
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Indexes
pendingOrderSchema.index({ userId: 1 });
pendingOrderSchema.index({ symbol: 1 });

export const PendingOrder = model<IPendingOrder>('PendingOrder', pendingOrderSchema);
