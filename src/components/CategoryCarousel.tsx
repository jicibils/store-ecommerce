import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import CategoryCard from "./CategoryCard";

export default function CategoryCarousel({
  categories,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
}) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      align: "start",
    },
    [
      AutoScroll({
        speed: 0.9,
        startDelay: 0,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
      }),
    ]
  );

  return (
    <div ref={emblaRef} className="overflow-hidden w-full bg-orange-600 py-4">
      <div className="flex gap-4 px-4">
        {[...categories, ...categories].map((cat, i) => (
          <div key={i} className="flex-shrink-0 w-40">
            <CategoryCard icon={cat.icon} label={cat.label} />
          </div>
        ))}
      </div>
    </div>
  );
}
