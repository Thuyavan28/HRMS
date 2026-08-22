import api from './api';

export const reviewService = {
  getMyReviews: async () => {
    const response = await api.get('/reviews/me');
    return response.data;
  }
};
