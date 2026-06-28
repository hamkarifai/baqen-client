# Fix for Daily Review Modal

1. Split `handleReviewed` into `onReviewed` (API callback) and `onNext` (queue advancement).
2. Update `DailyReviewFlashcardModal` to accept `onNext`.
3. In `DailyReviewFlashcardModal`, call `onNext()` only when the user clicks "Lanjut" or "Selesai" in the success modal.
