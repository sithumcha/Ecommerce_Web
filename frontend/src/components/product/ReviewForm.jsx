import React, { useState } from 'react';
import { Star, Camera, X } from 'lucide-react';
import Button from '../common/Button';

const ReviewForm = ({ onSubmit, loading }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit({ rating, comment, image });
    setComment('');
    setImage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Your Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none transition-colors"
            >
              <Star
                size={22}
                className={`${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 fill-slate-100 dark:text-dark-700 dark:fill-dark-900'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          Review Comment
        </label>
        <textarea
          id="comment"
          rows="4"
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          className="form-input w-full resize-none"
        ></textarea>
      </div>

      {/* Review Image Attachment Uploader */}
      <div className="space-y-2">
        <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Add Photo (Optional)
        </span>
        
        {image ? (
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 shrink-0">
            <img src={image} alt="Review preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setImage('')}
              className="absolute top-1 right-1 p-0.5 bg-red-500 hover:bg-red-650 text-white rounded-full transition-colors"
            >
              <X size={10} />
            </button>
          </div>
        ) : (
          <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-900 dark:hover:bg-dark-800 text-slate-650 dark:text-slate-200 text-xs font-extrabold rounded-xl border border-slate-200 dark:border-dark-800 hover:border-slate-350 dark:hover:border-dark-700 transition-all cursor-pointer">
            <Camera size={14} />
            Choose Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      <Button type="submit" loading={loading} disabled={!comment.trim()}>
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;
