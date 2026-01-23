import { useRef } from "react";

import cover1 from "../assets/course-covers/cover-1.jpg";
import cover2 from "../assets/course-covers/cover-2.jpg";
import cover3 from "../assets/course-covers/cover-3.jpg";

const banners = [
  {
    id: 0,
    image: cover1,
    title: "Learn skills that compound",
    subtitle: "From fundamentals to real-world confidence",
  },
  {
    id: 1,
    image: cover2,
    title: "Structured learning paths",
    subtitle: "Designed for long-term growth",
  },
  {
    id: 2,
    image: cover3,
    title: "Build, practice, master",
    subtitle: "Not just videos, but real skills",
  },
];

export default function HeroCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;

    const container = carouselRef.current;
    const slideWidth = container.clientWidth;

    container.scrollTo({
      left: slideWidth * index,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full mb-16">
      <div
        ref={carouselRef}
        className="
          carousel w-full
          overflow-hidden
          scroll-smooth
        "
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="carousel-item relative w-full"
          >
            {/* Image */}
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-[560px] object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/45" />

            {/* Text */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-10 text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {banner.title}
                </h2>
                <p className="text-lg md:text-xl text-white/85 max-w-2xl">
                  {banner.subtitle}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div
              className="
                absolute left-6 right-6 top-1/2
                flex -translate-y-1/2 justify-between
              "
            >
              <button
                className="btn btn-circle btn-lg"
                onClick={() =>
                  scrollToIndex(
                    (index - 1 + banners.length) % banners.length
                  )
                }
              >
                ❮
              </button>

              <button
                className="btn btn-circle btn-lg"
                onClick={() =>
                  scrollToIndex(
                    (index + 1) % banners.length
                  )
                }
              >
                ❯
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
