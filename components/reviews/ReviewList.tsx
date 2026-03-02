import { Review } from "@/types";
import { Star, User } from "lucide-react";
import Image from "next/image";

interface ReviewListProps {
    reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
    if (reviews.length === 0) {
        return <div className="text-secondary py-8 italic">No reviews yet. Be the first to review!</div>;
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 relative bg-gray-100 rounded-full overflow-hidden flex items-center justify-center text-secondary">
                             {review.user?.avatar ? (
                                <Image src={review.user.avatar} alt="User" fill className="object-cover"/>
                             ) : (
                                <User className="w-5 h-5" />
                             )}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{review.user?.firstName || 'Anonymous'} {review.user?.lastName}</p>
                            <span className="text-xs text-secondary">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                                key={star} 
                                className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                            />
                        ))}
                    </div>

                    <p className="text-gray-700 text-sm">{review.comment}</p>
                </div>
            ))}
        </div>
    );
}
