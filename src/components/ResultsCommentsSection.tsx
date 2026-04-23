import { useEffect, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { MessageSquareText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { sendReviewNotification } from "@/lib/send-order-email";
import { useReveal } from "@/hooks/useReveal";

interface ReviewComment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  rating: number;
  approved: boolean;
  createdAt: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < rating;
        return (
          <Star
            key={index}
            className={`h-4 w-4 ${filled ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
          />
        );
      })}
    </div>
  );
}

export default function ResultsCommentsSection() {
  const { user, signInWithGoogle } = useAuth();
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const leftColRef = useReveal();
  const rightColRef = useReveal();

  useEffect(() => {
    let active = true;

    getDocs(collection(db, "results_comments"))
      .then((snapshot) => {
        if (!active) return;
        const approvedComments = snapshot.docs
          .map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() } as ReviewComment))
          .filter((comment) => comment.approved)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setComments(approvedComments);
      })
      .catch(() => {
        if (active) setComments([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    if (!user) {
      await signInWithGoogle();
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "results_comments"), {
        userId: user.uid,
        userName: user.displayName || "Dharmi User",
        userEmail: user.email || "",
        rating,
        message: message.trim(),
        approved: false,
        createdAt: new Date().toISOString(),
      });

      // Notify admin
      await sendReviewNotification({
        data: {
          userName: user.displayName || "Dharmi User",
          rating,
          message: message.trim(),
        }
      });

      setMessage("");
      setRating(5);
      setSubmitted(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div ref={leftColRef} className="reveal-on-scroll animate-fade-in-left">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Customer Voices</span>
            <h2 className="mt-3 font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Share Your <span className="text-gradient-gold">Result</span>
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Leave your review and rating. Your comment will appear here after the admin approves it.
            </p>

            <div className="mt-6 rounded-3xl border border-border bg-card p-5 sm:p-6 hover-lift">
              <label className="text-sm font-medium text-foreground">Your rating</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                      rating === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-accent"
                    }`}
                  >
                    {value} Star{value > 1 ? "s" : ""}
                  </button>
                ))}
              </div>

              <label className="mt-5 block text-sm font-medium text-foreground">Your comment</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                placeholder="Tell people about your experience with Dharmi Ayurveda"
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />

              <Button variant="cta" className="mt-4 w-full sm:w-auto hover-lift" onClick={handleSubmit} disabled={saving}>
                <MessageSquareText className="h-4 w-4" />
                {saving ? "Submitting..." : user ? "Submit review" : "Sign in to review"}
              </Button>

              {submitted && (
                <p className="mt-3 text-sm font-medium text-primary">
                  Thanks! Your comment is waiting for admin approval.
                </p>
              )}
            </div>
          </div>

          <div ref={rightColRef} className="reveal-on-scroll animate-fade-in-right">
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-2xl font-bold text-foreground">Reviews</h3>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {comments.length} Live
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {comments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
                    No reviews yet.
                  </div>
                ) : (
                  comments.map((comment) => (
                    <article key={comment.id} className="rounded-2xl border border-border bg-background px-4 py-4 hover-lift transition-all duration-300">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{comment.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                        <Stars rating={comment.rating} />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">“{comment.message}”</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
