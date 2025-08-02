
// Team von AI Tiertrainern
export const trainerTeam = [
  { firstName: "Marc", lastName: "W.", specialty: "Hunde, Grundgehorsam" },
  { firstName: "Lisa", lastName: "M.", specialty: "Katzen, Verhaltensprobleme" },
  { firstName: "Tom", lastName: "B.", specialty: "Hunde, Aggression" },
  { firstName: "Anna", lastName: "K.", specialty: "Welpen, Sozialisation" },
  { firstName: "Max", lastName: "S.", specialty: "Exotische Tiere" },
  { firstName: "Nina", lastName: "H.", specialty: "Pferde, Training" },
  { firstName: "Paul", lastName: "L.", specialty: "Alte Tiere, Rehabilitation" }
];

export const assignTrainerForSession = () => {
  // Wähle einen zufälligen Trainer für diese Session
  const trainer = trainerTeam[Math.floor(Math.random() * trainerTeam.length)];
  return `${trainer.firstName} ${trainer.lastName}`;
};
