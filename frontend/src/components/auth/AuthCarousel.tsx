import { useEffect, useState } from "react";
import carousel1 from "../../assets/carousel/carousel-1.jpg";
import carousel2 from "../../assets/carousel/carousel-2.jpg";
import carousel3 from "../../assets/carousel/carousel-3.jpg";

const carouselImages = [
  {
    src: carousel1,
    alt: "Imagen del evento TeamDraft 1",
  },
  {
    src: carousel2,
    alt: "Imagen del evento TeamDraft 2",
  },
  {
    src: carousel3,
    alt: "Imagen del evento TeamDraft 3",
  },
];

function AuthCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) =>
        currentIndex === carouselImages.length - 1 ? 0 : currentIndex + 1,
      );
    }, 3500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section className="auth-carousel" aria-label="Galería TeamDraft">
      <div className="auth-carousel-card">
        {carouselImages.map((image, index) => (
          <img
            key={image.src}
            className={`auth-carousel-photo ${
              index === activeIndex ? "auth-carousel-photo-active" : ""
            }`}
            src={image.src}
            alt={image.alt}
          />
        ))}

        <div className="auth-carousel-dots" aria-hidden="true">
          {carouselImages.map((image, index) => (
            <span
              key={image.src}
              className={`auth-carousel-dot ${
                index === activeIndex ? "auth-carousel-dot-active" : ""
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AuthCarousel;
