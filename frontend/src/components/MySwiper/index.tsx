import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards"
import { EffectCards } from 'swiper/modules';

function index({ slides }: { slides: any[] }) {
  return (
    <Swiper
      spaceBetween={50}
      slidesPerView={1}
      onSlideChange={() => console.log("slide change")}
      onSwiper={(swiper) => console.log(swiper)}
      effect="cards"
      grabCursor={true}
      modules={[EffectCards]}
    >
      {slides.map((slide: any, index: number) => {
        return <SwiperSlide
          key={index}
        >hello {index}</SwiperSlide>;
      })}
    </Swiper>
  );
}

export default index;
