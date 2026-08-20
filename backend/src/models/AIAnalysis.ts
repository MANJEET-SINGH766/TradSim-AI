import { Schema, model, Document, Types } from 'mongoose';

export interface IAIAnalysis extends Document {
  userId: Types.ObjectId;
  queryType: 'STOCK' | 'PORTFOLIO';
  symbol?: string;
  promptText: string;
  responseText: string;
  createdAt: Date;
}

const aiAnalysisSchema = new Schema<IAIAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    queryType: {
      type: String,
      required: true,
      enum: ['STOCK', 'PORTFOLIO'],
    },
    symbol: {
      type: String,
      uppercase: true,
      trim: true,
    },
    promptText: {
      type: String,
      required: true,
    },
    responseText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Indexes for query performance
aiAnalysisSchema.index({ userId: 1 });
aiAnalysisSchema.index({ userId: 1, symbol: 1 });

export const AIAnalysis = model<IAIAnalysis>('AIAnalysis', aiAnalysisSchema);
