import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import CategoryCard from "./CategoryCard";

export default function CategoryCarousel({
  categories,
  onSelectCategory,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: { id: string; name: string; icon: any }[];
  onSelectCategory: (categoryId: string) => void;
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
        stopOnMouseEnter: true,
      }),
    ]
  );

  return (
    <div ref={emblaRef} className="overflow-hidden w-full py-4 relative z-1">
      <div className="flex gap-4 px-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex-shrink-0 w-40"
            onClick={() => onSelectCategory(cat.id)}
          >
            <CategoryCard icon={cat.icon} label={cat.name} />
          </div>
        ))}
      </div>
    </div>
  );
}
