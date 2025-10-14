
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Pet } from "./types";
import { Filter, Sparkles, Target, Users, FileText, HelpCircle, Search, X, Zap, Star, Clock, CheckCircle, Crown, BookOpen, HandHeart } from "lucide-react";
import { useState, useMemo } from "react";

interface PetFilterProps {
  pets: Pet[];
  selectedPlanType: string;
  selectedPetId: string;
  onPlanTypeChange: (planType: string) => void;
  onPetChange: (petId: string) => void;
  plansCount?: number;
}

const getPetIcon = (species: string) => {
  if (!species) return '🐾';
  
  const normalizedSpecies = species.toLowerCase().trim();
  
  switch (normalizedSpecies) {
    case 'hund':
    case 'dog': 
      return '🐶';
    case 'katze':
    case 'cat':
    case 'katz':
      return '🐱';
    case 'pferd':
    case 'horse':
      return '🐴';
    case 'vogel':
    case 'bird':
      return '🐦';
    case 'nager':
    case 'hamster':
    case 'meerschweinchen':
    case 'guinea pig':
    case 'rabbit':
    case 'kaninchen':
      return '🐹';
    default: 
      return '🐾';
  }
};

const getFilterDisplayName = (selectedPetId: string, pets: Pet[], t: any) => {
  if (selectedPetId === "all") return t('petFilter.petSpecific.showAll.label');
  
  const pet = pets.find(p => p.id === selectedPetId);
  if (pet) {
    return `${getPetIcon(pet.species)} ${pet.name}`;
  }
  
  return "Select Pet";
};

const getFilterIcon = (filterValue: string) => {
  switch (filterValue) {
    case "all":
      return <Users className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

const getFilterColor = (filterValue: string) => {
  switch (filterValue) {
    case "all":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "text-purple-600 dark:text-purple-400";
  }
};

const getFilterBadgeColor = (filterValue: string) => {
  switch (filterValue) {
    case "all":
      return "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600/50";
    case "supported":
      return "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600/50";
    case "manual":
      return "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600/50";
    default:
      return "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600/50";
  }
};

export const PetFilter = ({ pets, selectedPlanType, selectedPetId, onPlanTypeChange, onPetChange, plansCount = 0 }: PetFilterProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePlanTypeChange = (value: string) => {
    console.log('🔄 PetFilter: Changing plan type to:', value);
    onPlanTypeChange(value);
    // Invalidate training plans cache for immediate refresh
    queryClient.invalidateQueries({ 
      queryKey: ['training-plans-with-steps'],
      exact: false 
    });
  };

  const handlePetChange = (value: string) => {
    console.log('🔄 PetFilter: Changing pet to:', value);
    onPetChange(value);
    // Invalidate training plans cache for immediate refresh
    queryClient.invalidateQueries({ 
      queryKey: ['training-plans-with-steps'],
      exact: false 
    });
  };

  // Enhanced pet validation with fallbacks
  const validPets = pets.filter(pet => {
    if (!pet || !pet.id) {
      return false;
    }
    
    // Accept pets with fallback values
    const hasName = pet.name && pet.name !== 'undefined';
    const hasSpecies = pet.species && pet.species !== 'undefined';
    
    if (!hasName || !hasSpecies) {
      return false;
    }
    
    return true;
  });

  // Filter pets based on search term
  const filteredPets = useMemo(() => {
    if (!searchTerm) return validPets;
    
    return validPets.filter(pet => 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.species.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [validPets, searchTerm]);

  // New filter options
  const planFilters = [
    { 
      value: "all", 
      label: t('petFilter.planTypes.all.label'), 
      icon: Users, 
      color: "blue",
      description: t('petFilter.planTypes.all.description')
    },
    { 
      value: "supported", 
      label: t('petFilter.planTypes.supported.label'), 
      icon: Crown, 
      color: "purple",
      description: t('petFilter.planTypes.supported.description')
    },
    { 
      value: "manual", 
      label: t('petFilter.planTypes.manual.label'), 
      icon: BookOpen, 
      color: "green",
      description: t('petFilter.planTypes.manual.description')
    },
  ];

  // Always show filter when there are pets (even with just one pet)
  if (validPets.length === 0) {
    return null;
  }

  return (
    <Card className="w-full bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/10 border-2 border-blue-100/50 dark:border-blue-800/30 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex-shrink-0">
                <Filter className="h-5 w-5 sm:h-5.5 sm:w-5.5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 sm:gap-2">
                  <span className="truncate">{t('petFilter.title')}</span>
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 animate-pulse flex-shrink-0" />
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {t('petFilter.description')}
                </p>
              </div>
            </div>
            
            {/* Plans Count Badge */}
            {plansCount > 0 && (
              <Badge variant="outline" className={`${getFilterBadgeColor(selectedPlanType)} px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap flex-shrink-0`}>
                <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{plansCount} {plansCount === 1 ? t('petFilter.plansCount.plan') : t('petFilter.plansCount.plans')}</span>
                <span className="sm:hidden">{plansCount}</span>
              </Badge>
            )}
          </div>

          {/* Plan Type Filter Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t('petFilter.planTypes.label')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {planFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = selectedPlanType === filter.value;
                console.log(`🔍 Filter button ${filter.value}: isActive = ${isActive}, selectedPlanType = ${selectedPlanType}`);
                return (
                  <Button
                    key={filter.value}
                    variant={isActive ? "default" : "outline"}
                    size="lg"
                    onClick={() => handlePlanTypeChange(filter.value)}
                    className={`h-auto p-3 sm:p-4 transition-all duration-200 touch-manipulation ${
                      isActive 
                        ? `bg-gradient-to-r from-${filter.color}-500 to-${filter.color}-600 text-white shadow-md hover:shadow-lg` 
                        : `hover:bg-${filter.color}-50 dark:hover:bg-${filter.color}-950/30 border-${filter.color}-200 dark:border-${filter.color}-600/50`
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5 sm:gap-2 text-center w-full">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-xs sm:text-sm">{filter.label}</div>
                      </div>
                      {isActive && <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Pet-Specific Filter Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <HandHeart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{t('petFilter.petSpecific.label')}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[10px] sm:text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap flex-shrink-0 h-8"
              >
                {showAdvanced ? t('petFilter.petSpecific.toggle.hide') : t('petFilter.petSpecific.toggle.show')}
              </Button>
            </div>

            {showAdvanced && (
              <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                  <Input
                    placeholder={t('petFilter.petSpecific.search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 pr-8 sm:pr-10 bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-sm h-9 sm:h-10"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 touch-manipulation"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Pet Selection */}
                <div className="space-y-1.5 sm:space-y-2">
                  {/* Show All Pets Option */}
                  <Button
                    variant={selectedPetId === "all" ? "default" : "outline"}
                    onClick={() => handlePetChange("all")}
                    className={`w-full justify-start transition-all duration-200 min-h-[44px] touch-manipulation ${
                      selectedPetId === "all" 
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg" 
                        : "hover:bg-blue-50 dark:hover:bg-blue-950/30 border-blue-200 dark:border-blue-600/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="font-medium text-sm sm:text-base truncate">{t('petFilter.petSpecific.showAll.label')}</span>
                        <span className="text-[10px] sm:text-xs opacity-75 truncate">{t('petFilter.petSpecific.showAll.description')}</span>
                      </div>
                      {selectedPetId === "all" && <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1 sm:ml-2 flex-shrink-0" />}
                    </div>
                  </Button>

                  {filteredPets.length > 0 ? (
                    filteredPets.map(pet => {
                      console.log(`🔍 Pet button ${pet.name}: selectedPetId = ${selectedPetId}, pet.id = ${pet.id}`);
                      return (
                        <Button
                          key={pet.id}
                          variant={selectedPetId === pet.id ? "default" : "outline"}
                          onClick={() => handlePetChange(pet.id)}
                          className={`w-full justify-start transition-all duration-200 min-h-[44px] touch-manipulation ${
                            selectedPetId === pet.id 
                              ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md hover:shadow-lg" 
                              : "hover:bg-purple-50 dark:hover:bg-purple-950/30 border-purple-200 dark:border-purple-600/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
                            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-600 dark:text-purple-400 flex-shrink-0">
                              <span className="text-base sm:text-lg">{getPetIcon(pet.species)}</span>
                            </div>
                            <div className="flex flex-col items-start flex-1 min-w-0">
                              <span className="font-medium text-sm sm:text-base truncate w-full">{pet.name}</span>
                              <span className="text-[10px] sm:text-xs opacity-75 truncate w-full">{pet.species}</span>
                            </div>
                            {selectedPetId === pet.id && <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1 sm:ml-2 flex-shrink-0" />}
                          </div>
                        </Button>
                      );
                    })
                    ) : (
                    <div className="text-center py-3 sm:py-4 text-gray-500 dark:text-gray-400">
                      <Search className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1.5 sm:mb-2 opacity-50" />
                      <p className="text-xs sm:text-sm">{t('petFilter.petSpecific.search.noResults', { searchTerm })}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Traditional Dropdown (Fallback) */}
            {!showAdvanced && (
              <Select value={selectedPetId} onValueChange={handlePetChange}>
                <SelectTrigger className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-300 dark:border-blue-600/50 dark:hover:border-blue-500 transition-all duration-200 shadow-md hover:shadow-lg min-h-[44px] h-auto py-2">
                  <SelectValue>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 ${getFilterColor(selectedPetId)} flex-shrink-0`}>
                        {getFilterIcon(selectedPetId)}
                      </div>
                      <span className="font-medium truncate text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                        {getFilterDisplayName(selectedPetId, validPets, t)}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-600/50 shadow-xl z-50 max-h-80">
                  {/* Show All Pets Option */}
                  <SelectItem key="all" value="all" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 transition-all duration-200">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 py-1.5 sm:py-2">
                      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                          {t('petFilter.petSpecific.showAll.label')}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                          {t('petFilter.petSpecific.showAll.description')}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                  {validPets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/30 dark:hover:to-pink-950/30 transition-all duration-200">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 py-1.5 sm:py-2">
                        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-600 dark:text-purple-400 flex-shrink-0">
                          <span className="text-base sm:text-lg">{getPetIcon(pet.species)}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                            {pet.name}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                            {pet.species} • {t('petFilter.petSpecific.petSpecificPlans')}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Description */}
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-3 py-2 sm:px-4 sm:py-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">
                {selectedPlanType === "all" && selectedPetId === "all" && t('petFilter.descriptions.allPlans')}
                {selectedPlanType === "supported" && selectedPetId === "all" && t('petFilter.descriptions.supportedPlans')}
                {selectedPlanType === "manual" && selectedPetId === "all" && t('petFilter.descriptions.manualPlans')}
                {selectedPetId !== "all" && (
                  t('petFilter.descriptions.petSpecific', {
                    petName: validPets.find(p => p.id === selectedPetId)?.name || 'selected pet',
                    planType: selectedPlanType !== "all" ? ` (${selectedPlanType === "supported" ? "trainer-supported" : "manual"} only)` : ""
                  })
                )}
              </span>
            </div>
          </div>
          

        </div>
      </CardContent>
    </Card>
  );
};
