import { Schema, model, Document, Types } from 'mongoose';

export interface IWatchlist extends Document {
  userId: Types.ObjectId;
  symbols: string[];
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    symbols: {
      type: [String],
      default: [],
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
  }
);

// Index on userId
watchlistSchema.index({ userId: 1 }, { unique: true });

export const Watchlist = model<IWatchlist>('Watchlist', watchlistSchema);
