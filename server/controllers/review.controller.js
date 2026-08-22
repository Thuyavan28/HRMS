import { dataStore } from '../repositories/dataStore.js';

export const getMyReviews = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const reviews = dataStore.getReviewsForEmployee(employeeId);

    // Calculate average score
    const avgScore = reviews.length > 0
      ? Math.round(reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length)
      : 0;

    const latestReview = reviews[0] || null;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        latestReview,
        performanceScore: avgScore,
        summary: {
          totalReviews: reviews.length,
          latestRating: latestReview ? latestReview.rating : 'N/A',
          latestPeriod: latestReview ? latestReview.period : 'N/A'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
