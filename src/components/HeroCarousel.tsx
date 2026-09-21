import { useEffect, useState } from "react";
import Icon, { type IconName } from "./Icon";

interface Slide {
  title: string;
  subtitle: string;
  gradient: string;
  icon: IconName;
}

const SLIDES: Slide[] = [
  {
    title: "9 月新月祭典",
    subtitle: "活動期間 9/1 ~ 9/30，全站消費滿額送限定徽章",
    gradient: "from-indigo-600 via-purple-600 to-pink-500",
    icon: "moon",
  },
  {
    title: "熱門新番一番賞上架",
    subtitle: "《葬送的芙莉蓮》、《咒術迴戰》現貨開抽中",
    gradient: "from-emerald-500 via-teal-500 to-cyan-400",
    icon: "wand",
  },
  {
    title: "新手抽賞攻略",
    subtitle: "第一次抽賞就上手，看這篇就夠了",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    icon: "book",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.title}
            className={`flex h-56 w-full shrink-0 flex-col items-center justify-center gap-2 bg-gradient-to-br px-6 text-center text-white sm:h-72 ${slide.gradient}`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/40 backdrop-blur-sm sm:h-20 sm:w-20">
              <Icon name={slide.icon} className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h2 className="text-xl font-black sm:text-3xl">{slide.title}</h2>
            <p className="text-sm text-white/90 sm:text-base">{slide.subtitle}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="上一張"
        onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg font-bold text-brand-ink hover:bg-white"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="下一張"
        onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-lg font-bold text-brand-ink hover:bg-white"
      >
        ›
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            aria-label={`前往第 ${i + 1} 張`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
