import { Link } from "react-router-dom";
import { MapPin, Bookmark } from "lucide-react";
import type { User } from "@/lib/types";
import { RatingStars } from "./RatingStars";
import { VerifiedBadge } from "./VerifiedBadge";
import { Button } from "./ui/button";

interface ContractorCardProps {
  contractor: User;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function ContractorCard({ contractor, isSaved = false, onToggleSave }: ContractorCardProps) {
  const id = contractor._id || contractor.id;
  const avatarUrl =
    contractor.profileImage?.url ||
    contractor.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${contractor.name}`;

  return (
    <div className="group rounded-lg border bg-card p-4 card-shadow transition-all hover:card-shadow-hover">
      <div className="flex gap-4">
        <img
          src={avatarUrl}
          alt={contractor.name}
          className="h-20 w-20 shrink-0 rounded-lg bg-secondary object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">
                {contractor.name}
              </h3>
              <p className="text-sm font-medium text-primary truncate">
                {contractor.trade || "General"}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {contractor.isVerified && <VerifiedBadge />}
              {onToggleSave && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleSave();
                  }}
                  title={isSaved ? "Remove from saved" : "Save tradie"}
                  className="rounded-full p-1.5 transition-colors hover:bg-muted"
                  aria-label={isSaved ? "Remove from saved tradies" : "Save this tradie"}
                >
                  <Bookmark
                    size={16}
                    className={
                      isSaved
                        ? "fill-primary text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }
                  />
                </button>
              )}
            </div>
          </div>

          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} />
            {contractor.location || "Location not set"}
          </div>

          <div className="mt-1">
            <RatingStars
              rating={contractor.averageRating || 0}
              size={14}
              reviewCount={contractor.reviewCount || 0}
            />
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {contractor.bio || "No description provided."}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              {contractor.hourlyRate ? `$${contractor.hourlyRate}/hr` : "Rate not set"}
            </span>
            <Button asChild size="sm">
              <Link to={`/contractors/${id}`}>View Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
