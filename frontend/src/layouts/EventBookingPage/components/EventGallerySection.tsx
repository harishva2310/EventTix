import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface GallerySectionProps {
  images: string[];
}

export const EventGallerySection = ({ images }: GallerySectionProps) => {
  return (
    <div className="mt-8 sm:mt-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">Event Gallery</h2>
      <div className="relative px-4 sm:px-12">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {images.map((image: string, index: number) => (
              <CarouselItem key={index}>
                <img
                  src={`/img/${image}`}
                  alt={`Event image ${index + 1}`}
                  className="w-full h-[200px] sm:h-[400px] md:h-[600px] object-cover rounded-lg"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 hidden sm:flex" />
          <CarouselNext className="absolute right-0 hidden sm:flex" />
        </Carousel>
      </div>
    </div>
  );
};
