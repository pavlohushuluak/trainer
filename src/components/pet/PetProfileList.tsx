
import React from "react";
import PetProfileCard from "./PetProfileCard";

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

interface PetProfileListProps {
  pets: PetProfile[];
  onEdit: (pet: PetProfile) => void;
  onDelete: (petId: string, petName: string) => void;
}

const PetProfileList = React.memo(({ pets, onEdit, onDelete }: PetProfileListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pets.map((pet) => (
        <PetProfileCard
          key={pet.id}
          pet={pet}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

PetProfileList.displayName = 'PetProfileList';

export default PetProfileList;
