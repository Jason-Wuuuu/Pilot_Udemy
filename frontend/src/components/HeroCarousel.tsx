const banners = [
  {
    id: 1,
    image: "../assets/react.svg",
    title: "Learn skills that compound",
    subtitle: "From fundamentals to real-world confidence",
  },
  {
    id: 2,
    image: "../assets/banners/banner-2.jpg",
    title: "Structured learning paths",
    subtitle: "Designed for long-term growth",
  },
  {
    id: 3,
    image: "/assets/banners/banner-3.jpg",
    title: "Build, practice, master",
    subtitle: "Not just videos, but real skills",
  },
];

export default function HeroCarousel() {
  return (
    <div className="w-full mb-12">
      <div className="carousel w-full rounded-xl overflow-hidden">
        {banners.map((b) => (
          <div key={b.id} className="carousel-item relative w-full">
            {/* Image */}
            <img
              src={b.image}
              className="w-full h-[320px] object-cover"
              alt={b.title}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Text */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-10 text-white">
                <h2 className="text-3xl font-bold mb-2">{b.title}</h2>
                <p className="text-lg text-white/80">{b.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
