import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileCard } from "@/components/ui/profile-card";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { mockApi } from "@/lib/mockApi";
import { User, Skill } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";

// Converted to use real data structure

const categories = [
  "All Categories",
  "Programming",
  "Design", 
  "Music",
  "Languages",
  "Photography",
  "Business",
  "Fitness",
  "Cooking",
];

export default function BrowseSkills() {
  const [users, setUsers] = useState<User[]>([]);
  const [userSkills, setUserSkills] = useState<Record<number, Skill[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await mockApi.users.search();
      setUsers(usersData);

      // Load skills for each user
      const skillsData: Record<number, Skill[]> = {};
      for (const user of usersData) {
        skillsData[user.id] = await mockApi.skills.getByUser(user.id);
      }
      setUserSkills(skillsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    try {
      setIsLoading(true);
      const usersData = await mockApi.users.search(query);
      setUsers(usersData);

      // Load skills for filtered users
      const skillsData: Record<number, Skill[]> = {};
      for (const user of usersData) {
        skillsData[user.id] = await mockApi.skills.getByUser(user.id);
      }
      setUserSkills(skillsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // In a real app, this would filter by category
  };

  const handleRequestSwap = async (userId: number) => {
    if (!currentUser) return;

    try {
      await mockApi.swaps.create({
        requesterId: currentUser.id,
        targetId: userId,
        status: "PENDING"
      });

      toast({
        title: "Request sent! 🎉",
        description: "Your swap request has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send swap request",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Skills</h1>
          <p className="text-muted-foreground">
            Find people with skills you want to learn and share what you know
          </p>
        </motion.div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for skills or people..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {users.length} results
        </p>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-lg h-64"></div>
          ))
        ) : (
          users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProfileCard
                user={{
                  id: user.id.toString(),
                  name: user.name,
                  location: user.location || "",
                  avatar: user.avatarUrl,
                  rating: user.ratingAvg,
                  isOnline: true,
                  skillsOffered: userSkills[user.id]?.filter(s => s.type === 'OFFER').map(s => s.name) || [],
                  skillsWanted: userSkills[user.id]?.filter(s => s.type === 'WANT').map(s => s.name) || [],
                  availability: user.availability,
                }}
                onRequestSwap={(userId) => handleRequestSwap(parseInt(userId))}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Empty State */}
      {!isLoading && users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}