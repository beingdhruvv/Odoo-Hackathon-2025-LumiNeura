import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkillTag } from "@/components/ui/skill-tag";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  user: {
    id: string;
    name: string;
    location: string;
    avatar?: string;
    rating: number;
    isOnline?: boolean;
    skillsOffered: string[];
    skillsWanted: string[];
    availability: string[];
  };
  onRequestSwap?: (userId: string) => void;
  className?: string;
}

export function ProfileCard({ user, onRequestSwap, className }: ProfileCardProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className={cn(
      "group relative overflow-hidden bg-card transition-all duration-300 hover:shadow-hover",
      className
    )}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{user.location}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{user.rating}</span>
          </div>
        </div>

        {/* Skills Offered */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Skills Offered:</h4>
          <div className="flex flex-wrap gap-2">
            {user.skillsOffered.slice(0, 3).map((skill) => (
              <SkillTag key={skill} variant="offered">
                {skill}
              </SkillTag>
            ))}
            {user.skillsOffered.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{user.skillsOffered.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Looking for:</h4>
          <div className="flex flex-wrap gap-2">
            {user.skillsWanted.slice(0, 3).map((skill) => (
              <SkillTag key={skill} variant="wanted">
                {skill}
              </SkillTag>
            ))}
            {user.skillsWanted.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{user.skillsWanted.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{user.availability.join(", ")}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onRequestSwap?.(user.id)}
          className="w-full bg-gradient-primary hover:shadow-lg transition-all duration-200"
        >
          Request Swap
        </Button>
      </CardContent>
    </Card>
  );
}