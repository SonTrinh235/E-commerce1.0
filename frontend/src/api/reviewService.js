import { apiFetch } from "./apiClient";

export async function getReviewsByProductId(productId) {
   console.log(`[Review Service] Calling getReviewsByProductId(${productId})`);
  try {
    const response = await apiFetch(`/product/products/${productId}`, {
      method: "GET",
    });
    const productData = response?.data || {};
    const rawRatings = Array.isArray(productData.ratings) ? productData.ratings : [];
    const mappedRatings = rawRatings.map(r => ({
      ...r,
      rating: r.score,
    }));

    return {
      success: true,
      data: mappedRatings
    };

  } catch (error) {
    console.error("[Review Service] Error fetching reviews:", error);
    return { data: [] }; 
  }
}

export async function createReview(reviewData) {
  console.log("[Review Service] Calling createReview", reviewData);
  try {
    const data = await apiFetch(`/product/${reviewData.productId}/rate`, {
      method: "POST",
      body: {
        userId: reviewData.userId, 
        score: Number(reviewData.rating), 
        comment: String(reviewData.comment)
      },
    });
    return data;
  } catch (error) {
    console.error("[Review Service] Error creating review:", error);
    throw error;
  }
}