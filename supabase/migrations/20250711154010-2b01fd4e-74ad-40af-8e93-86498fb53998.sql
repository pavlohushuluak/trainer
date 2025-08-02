-- Phase 1: Datenbank-Integrität wiederherstellen
-- Repariere fehlende pet_id Zuordnungen basierend auf Plan-Titeln

-- Update Plan "Individueller Trainingsplan für Clark" mit Clark's pet_id
UPDATE training_plans 
SET pet_id = (
  SELECT pp.id 
  FROM pet_profiles pp 
  WHERE LOWER(pp.name) = 'clark' 
  AND pp.user_id = training_plans.user_id
)
WHERE title ILIKE '%clark%' 
AND pet_id IS NULL;

-- Update Plan "Individueller Trainingsplan für bittel" mit bittel's pet_id  
UPDATE training_plans 
SET pet_id = (
  SELECT pp.id 
  FROM pet_profiles pp 
  WHERE LOWER(pp.name) = 'bittel' 
  AND pp.user_id = training_plans.user_id
)
WHERE title ILIKE '%bittel%' 
AND pet_id IS NULL;

-- Für generische Pläne ohne spezifischen Tiernamen: Verknüpfe mit dem ersten Tier des Users
UPDATE training_plans 
SET pet_id = (
  SELECT pp.id 
  FROM pet_profiles pp 
  WHERE pp.user_id = training_plans.user_id
  ORDER BY pp.created_at ASC
  LIMIT 1
)
WHERE pet_id IS NULL 
AND title NOT ILIKE '%clark%' 
AND title NOT ILIKE '%bittel%'
AND EXISTS (
  SELECT 1 FROM pet_profiles pp2 
  WHERE pp2.user_id = training_plans.user_id
);