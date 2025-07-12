import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SkillTag } from "@/components/ui/skill-tag";
import { Camera, Plus, X, Star, MapPin } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/stores/authStore";
import { mockApi } from "@/lib/mockApi";
import { User, Skill } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().optional(),
  bio: z.string().optional(),
  availability: z.array(z.string()),
  isPublic: z.boolean()
});

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkillOffered, setNewSkillOffered] = useState("");
  const [newSkillWanted, setNewSkillWanted] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      location: "",
      bio: "",
      availability: [],
      isPublic: true
    }
  });

  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const [profileData, skillsData] = await Promise.all([
        mockApi.users.getProfile(currentUser.id),
        mockApi.skills.getByUser(currentUser.id)
      ]);
      
      setProfile(profileData);
      setSkills(skillsData);
      
      // Update form values
      setValue("name", profileData.name);
      setValue("location", profileData.location || "");
      setValue("bio", profileData.bio || "");
      setValue("availability", profileData.availability);
      setValue("isPublic", profileData.isPublic);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSkillOffered = async () => {
    if (!currentUser || !newSkillOffered.trim()) return;
    
    try {
      const newSkill = await mockApi.skills.create({
        userId: currentUser.id,
        name: newSkillOffered.trim(),
        type: "OFFER"
      });
      setSkills([...skills, newSkill]);
      setNewSkillOffered("");
      toast({
        title: "Skill added",
        description: "Your offered skill has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    }
  };

  const addSkillWanted = async () => {
    if (!currentUser || !newSkillWanted.trim()) return;
    
    try {
      const newSkill = await mockApi.skills.create({
        userId: currentUser.id,
        name: newSkillWanted.trim(),
        type: "WANT"
      });
      setSkills([...skills, newSkill]);
      setNewSkillWanted("");
      toast({
        title: "Skill added",
        description: "Your wanted skill has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive",
      });
    }
  };

  const removeSkill = async (skillId: number) => {
    try {
      await mockApi.skills.delete(skillId);
      setSkills(skills.filter(s => s.id !== skillId));
      toast({
        title: "Skill removed",
        description: "Skill has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove skill",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: any) => {
    if (!currentUser) return;
    
    try {
      const updatedProfile = await mockApi.users.updateProfile(currentUser.id, data);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !profile) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const skillsOffered = skills.filter(s => s.type === 'OFFER');
  const skillsWanted = skills.filter(s => s.type === 'WANT');

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your skills and preferences</p>
        </div>
        
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/api/placeholder/150/150" />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    JD
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary-hover transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-semibold mb-2">{profile.name}</h2>
              
              {profile.location && (
                <div className="flex items-center justify-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              )}

              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-semibold">{profile.ratingAvg}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Rating</span>
                </div>
                
                <div className="text-center">
                  <div className="font-semibold">{skills.length}</div>
                  <span className="text-xs text-muted-foreground">Skills</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 mb-4">
                <Label htmlFor="public-profile" className="text-sm">
                  Public Profile
                </Label>
                <Switch
                  id="public-profile"
                  checked={watch("isPublic")}
                  onCheckedChange={(checked) => setValue("isPublic", checked)}
                  disabled={!isEditing}
                />
              </div>

              <Badge variant={watch("isPublic") ? "default" : "secondary"}>
                {watch("isPublic") ? "Public" : "Private"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      disabled={!isEditing}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      {...register("location")}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                {/* Save Changes */}
                {isEditing && (
                  <div className="flex justify-end mt-6">
                    <Button type="submit" className="bg-gradient-primary">
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Skills Offered */}
          <Card>
            <CardHeader>
              <CardTitle>Skills I Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {skillsOffered.map((skill) => (
                  <div key={skill.id} className="relative group">
                    <SkillTag variant="offered">
                      {skill.name}
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill.id)}
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </SkillTag>
                  </div>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill you offer"
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkillOffered()}
                  />
                  <Button onClick={addSkillOffered} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Wanted */}
          <Card>
            <CardHeader>
              <CardTitle>Skills I Want to Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {skillsWanted.map((skill) => (
                  <div key={skill.id} className="relative group">
                    <SkillTag variant="wanted">
                      {skill.name}
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill.id)}
                          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </SkillTag>
                  </div>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill you want to learn"
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkillWanted()}
                  />
                  <Button onClick={addSkillWanted} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </AuthGuard>
  );
}