
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import PetProfileCard from "./PetProfileCard";
import { useTranslation } from "react-i18next";

interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  birth_date?: string;
  behavior_focus?: string;
  notes?: string;
  created_at: string;
}

interface PetProfileCarouselProps {
  pets: PetProfile[];
  onEdit: (pet: PetProfile) => void;
  onDelete: (petId: string, petName: string) => void;
}

const PetProfileCarousel = ({ pets, onEdit, onDelete }: PetProfileCarouselProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {pets.map((pet) => (
            <CarouselItem key={pet.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <PetProfileCard
                pet={pet}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
      
      {/* Mobile navigation hint */}
      <div className="sm:hidden text-center mt-2">
        <p className="text-xs text-muted-foreground">
          {t('pets.carousel.swipeHint')}
        </p>
      </div>
    </div>
  );
};

export default PetProfileCarousel;
