"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useDialog } from "@/context/DialogContext";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const dialog = useDialog();
  const isAuthenticated = !!user;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-secondary mb-2">Please log in to write a review.</p>
        <a
          href="/login?redirect=back"
          className="text-primary font-bold underline"
        >
          Login Here
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      dialog.toast({ message: "Please select a rating", variant: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/products/${productId}/reviews`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) throw new Error("Failed to post review");

      setComment("");
      setRating(0);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      dialog.toast({ message: "Error submitting review", variant: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm"
    >
      <h3 className="font-bold mb-4">Write a Review</h3>

      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2">
          Comment
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Tell us what you like about this product..."
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white py-2 rounded-md font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
        Submit Review
      </button>
    </form>
  );
}
