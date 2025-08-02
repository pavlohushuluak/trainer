
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CommunityCard = () => {
  const navigate = useNavigate();

  const handleNavigateToCommunity = () => {
    navigate('/community');
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-purple-600" />
          🐾 TierTrainer Community
        </CardTitle>
        <CardDescription>
          Tausche dich mit anderen Tierbesitzern aus und teile deine Erfolge!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Community Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <div className="text-sm font-semibold text-gray-900">1,247</div>
            <div className="text-xs text-gray-600">Mitglieder</div>
          </div>
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <MessageCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <div className="text-sm font-semibold text-gray-900">3,892</div>
            <div className="text-xs text-gray-600">Beiträge</div>
          </div>
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Heart className="h-4 w-4 text-red-600 mx-auto mb-1" />
            <div className="text-sm font-semibold text-gray-900">12,340</div>
            <div className="text-xs text-gray-600">Likes</div>
          </div>
        </div>

        {/* Community Features */}
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Erfolgsgeschichten teilen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Tipps von anderen Tierbesitzern</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Fragen stellen und Antworten finden</span>
          </div>
        </div>

        <Button 
          onClick={handleNavigateToCommunity}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          Zur Community
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
