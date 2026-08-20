import { Request, Response, NextFunction } from 'express';
import { PortfolioService } from '../services/portfolioService';
import { AIService } from '../services/aiService';

/**
 * Controller to fetch active portfolio summaries
 */
export const getPortfolioSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access portfolio metrics.',
        },
      });
      return;
    }

    const portfolio = await PortfolioService.getPortfolioSummary(req.user._id.toString());

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch active portfolio AI audits
 */
export const getPortfolioAudit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to trigger portfolio audits.',
        },
      });
      return;
    }

    // 1. Gather active portfolio details from service
    const portfolio = await PortfolioService.getPortfolioSummary(req.user._id.toString());

    // 2. Call OpenAI Portfolio Auditor
    const auditText = await AIService.auditPortfolio(portfolio.cash, portfolio.holdings);

    res.status(200).json({
      success: true,
      data: {
        audit: auditText,
        auditedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};
