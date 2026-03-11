import { useFeaturedReviews } from "@/hooks/use-api";
import { RatingStars } from "@/components/RatingStars";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/types";
import { Loader2, Quote } from "lucide-react";

export function ReviewsSlider() {
  const { data: reviews = [], isLoading } = useFeaturedReviews(10);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container-main">
        <h2 className="text-2xl font-bold text-foreground">What Our Clients Say</h2>
        <p className="mt-1 text-muted-foreground">Trusted reviews from verified clients</p>
        <div className="mt-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {reviews.map((r) => {
                const reviewer = typeof r.reviewerId === "object" ? (r.reviewerId as User) : null;
                const reviewee = typeof r.revieweeId === "object" ? (r.revieweeId as User) : null;
                const name = reviewer?.name || "Anonymous";
                const avatar = reviewer?.avatar || (reviewer as { profileImage?: { url: string } })?.profileImage?.url;
                return (
                  <CarouselItem
                    key={r._id}
                    className="pl-2 md:pl-4 basis-full sm:basis-[85%] md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="rounded-xl border bg-card p-6 card-shadow h-full flex flex-col">
                      <Quote className="h-8 w-8 text-primary/30 mb-2" />
                      <p className="text-sm text-muted-foreground flex-1 line-clamp-4">{r.comment}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <RatingStars rating={r.rating} size={14} showValue={false} />
                      </div>
                      <div className="mt-4 flex items-center gap-3 pt-4 border-t">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatar} alt={name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground text-sm">{name}</p>
                          {reviewee && (
                            <p className="text-xs text-muted-foreground">
                              about {typeof reviewee === "object" ? reviewee.name : "contractor"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="-left-4 md:-left-12" />
            <CarouselNext className="-right-4 md:-right-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
