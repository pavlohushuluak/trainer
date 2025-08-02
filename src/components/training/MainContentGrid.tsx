
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, Award, Calendar } from "lucide-react";
import { Pet } from './types';
import { FirstStepsGuide } from './FirstStepsGuide';

interface MainContentGridProps {
  pets: Pet[];
}

const MainContentGrid = React.memo(({ pets }: MainContentGridProps) => {
  const isNewUser = pets.length === 0;

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      {/* First Steps Guide for new users */}
      <FirstStepsGuide pets={pets} />
    </div>
  );
});

MainContentGrid.displayName = 'MainContentGrid';

export default MainContentGrid;
