import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SkillTag } from "@/components/ui/skill-tag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  MessageCircle, 
  Calendar,
  Trash2 
} from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuthStore } from "@/stores/authStore";
import { mockApi } from "@/lib/mockApi";
import { Swap, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function Swaps() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  // Fallback mock data in case API fails
  const fallbackMockData = {
    pending: [
      {
        id: "1",
        type: "received",
        user: {
          name: "Sarah Chen",
          avatar: "/api/placeholder/100/100",
          rating: 4.8,
        },
        skillOffered: "Photography",
        skillWanted: "React Development",
        message: "Hi! I'd love to teach you photography in exchange for learning React.",
        date: "2024-01-15",
        status: "pending",
      },
      {
        id: "2", 
        type: "sent",
        user: {
          name: "Marcus Johnson",
          avatar: "/api/placeholder/100/100",
          rating: 4.9,
        },
        skillOffered: "Guitar",
        skillWanted: "UI/UX Design",
        message: "I can teach you guitar if you help me with UI/UX design!",
        date: "2024-01-14",
        status: "pending",
      },
    ],
    active: [
      {
        id: "3",
        user: {
          name: "Elena Rodriguez",
          avatar: "/api/placeholder/100/100", 
          rating: 4.7,
        },
        skillOffered: "Spanish",
        skillWanted: "TypeScript",
        startDate: "2024-01-10",
        nextSession: "2024-01-20",
        status: "active",
      },
    ],
    completed: [
      {
        id: "4",
        user: {
          name: "David Kim",
          avatar: "/api/placeholder/100/100",
          rating: 4.6,
        },
        skillOffered: "Data Science", 
        skillWanted: "Web Development",
        completedDate: "2024-01-05",
        status: "completed",
        myRating: null,
        theirRating: 5,
      },
    ],
  };
  
  // Transform API data to the format expected by the UI
  const transformedSwaps = useMemo(() => {
    console.log("Current swaps data:", swaps);
    
    // Use fallback data if swaps is undefined, null, or empty
    if (!swaps || !swaps.length) {
      console.log("Using fallback mock data");
      return fallbackMockData;
    }
    
    const transformed = {
      pending: [] as any[],
      active: [] as any[],
      completed: [] as any[],
    };
    
    swaps.forEach(swap => {
      const isRequester = swap.requesterId === currentUser?.id;
      const otherUser = isRequester ? swap.target : swap.requester;
      
      if (!otherUser) return; // Skip if user data is missing
      
      // For now, we're using placeholder data for skills
      // In a real app, you would fetch the actual skills associated with this swap
      const skillOffered = isRequester ? "Guitar Lessons" : "C++";
      const skillWanted = isRequester ? "Piano Lessons" : "Java";
      
      if (swap.status === 'PENDING') {
        transformed.pending.push({
          id: swap.id.toString(),
          type: isRequester ? "sent" : "received",
          user: {
            name: otherUser.name,
            avatar: otherUser.avatarUrl || "/api/placeholder/100/100",
            rating: otherUser.ratingAvg,
          },
          skillOffered,
          skillWanted,
          message: "Skill exchange request", // Placeholder message
          date: swap.requestedAt,
          status: "pending",
        });
      } else if (swap.status === 'ACTIVE') {
        transformed.active.push({
          id: swap.id.toString(),
          user: {
            name: otherUser.name,
            avatar: otherUser.avatarUrl || "/api/placeholder/100/100",
            rating: otherUser.ratingAvg,
          },
          skillOffered,
          skillWanted,
          startDate: swap.acceptedAt || swap.requestedAt,
          nextSession: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Placeholder: 1 week from now
          status: "active",
        });
      } else if (swap.status === 'PAST') {
        transformed.completed.push({
          id: swap.id.toString(),
          user: {
            name: otherUser.name,
            avatar: otherUser.avatarUrl || "/api/placeholder/100/100",
            rating: otherUser.ratingAvg,
          },
          skillOffered,
          skillWanted,
          completedDate: swap.acceptedAt || swap.requestedAt, // Using acceptedAt as a placeholder
          status: "completed",
          myRating: null, // Placeholder
          theirRating: null, // Placeholder
        });
      }
    });
    
    console.log("Transformed swaps:", transformed);
    
    // If no swaps were transformed, use fallback data
    if (transformed.pending.length === 0 && 
        transformed.active.length === 0 && 
        transformed.completed.length === 0) {
      console.log("No swaps were transformed, using fallback data");
      return fallbackMockData;
    }
    
    return transformed;
  }, [swaps, currentUser]);
  useEffect(() => {
    if (currentUser) {
      loadSwaps();
    }
  }, [currentUser]);

  const loadSwaps = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const swapsData = await mockApi.swaps.getByUser(currentUser.id);
      setSwaps(swapsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load swaps",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    console.log("Accepting request:", requestId);
    // In a real app, this would make an API call
  };

  const handleRejectRequest = (requestId: string) => {
    console.log("Rejecting request:", requestId);
    // In a real app, this would make an API call
  };

  const handleDeleteRequest = async (requestId: string) => {
    console.log("Deleting request:", requestId);
    
    try {
      // In a real app, this would make an API call to delete the request
      // For now, we'll just update our local state
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state by filtering out the deleted request
      setSwaps(prevSwaps => 
        prevSwaps.filter(swap => swap.id.toString() !== requestId)
      );
      
      toast({
        title: "Request cancelled",
        description: "The swap request has been cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel the request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateUser = (swapId: string, rating: number) => {
    console.log("Rating user:", swapId, rating);
    // In a real app, this would make an API call
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Swaps</h1>
        <p className="text-muted-foreground">
          Manage your skill exchange requests and active swaps
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({transformedSwaps.pending.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Active ({transformedSwaps.active.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Completed ({transformedSwaps.completed.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests */}
        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-16 w-16 bg-muted rounded-full mb-4"></div>
                  <div className="h-4 w-48 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-64 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ) : transformedSwaps.pending.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  Browse skills to send swap requests or wait for others to request your skills
                </p>
              </CardContent>
            </Card>
          ) : (
            transformedSwaps.pending.map((request) => (
              <Card key={request.id} className="hover:shadow-card transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.user.avatar} />
                      <AvatarFallback>
                        {request.user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{request.user.name}</h3>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm">{request.user.rating}</span>
                          </div>
                        </div>
                        <Badge>
                          {request.type === "received" ? "Received" : "Sent"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <SkillTag variant="offered" size="sm">
                          {request.skillOffered}
                        </SkillTag>
                        <span className="text-sm text-muted-foreground">for</span>
                        <SkillTag variant="wanted" size="sm">
                          {request.skillWanted}
                        </SkillTag>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {request.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.date).toLocaleDateString()}
                        </span>
                        
                        <div className="flex space-x-2">
                          {request.type === "received" ? (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                              <Button size="sm" onClick={() => handleAcceptRequest(request.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                            </>
                          ) : (
                            <Button
                              className="h-8 px-3 text-sm"
                              variant="outline"
                              onClick={() => handleDeleteRequest(request.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Active Swaps */}
        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-16 w-16 bg-muted rounded-full mb-4"></div>
                  <div className="h-4 w-48 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-64 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ) : transformedSwaps.active.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No active swaps</h3>
                <p className="text-muted-foreground">
                  Accept pending requests to start exchanging skills
                </p>
              </CardContent>
            </Card>
          ) : (
            transformedSwaps.active.map((swap) => (
              <Card key={swap.id} className="hover:shadow-card transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={swap.user.avatar} />
                      <AvatarFallback>
                        {swap.user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{swap.user.name}</h3>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm">{swap.user.rating}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-4">
                        <SkillTag variant="offered" size="sm">
                          {swap.skillOffered}
                        </SkillTag>
                        <span className="text-sm text-muted-foreground">for</span>
                        <SkillTag variant="wanted" size="sm">
                          {swap.skillWanted}
                        </SkillTag>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Started:</span>
                          <div>{new Date(swap.startDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Next Session:</span>
                          <div>{new Date(swap.nextSession).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button variant="outline">
                          <Calendar className="h-4 w-4 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Completed Swaps */}
        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-16 w-16 bg-muted rounded-full mb-4"></div>
                  <div className="h-4 w-48 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-64 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ) : transformedSwaps.completed.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No completed swaps</h3>
                <p className="text-muted-foreground">
                  Complete active swaps to see them here
                </p>
              </CardContent>
            </Card>
          ) : (
            transformedSwaps.completed.map((swap) => (
              <Card key={swap.id} className="hover:shadow-card transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={swap.user.avatar} />
                      <AvatarFallback>
                        {swap.user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{swap.user.name}</h3>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm">{swap.user.rating}</span>
                          </div>
                        </div>
                        <Badge>
                          Completed
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <SkillTag variant="offered" size="sm">
                          {swap.skillOffered}
                        </SkillTag>
                        <span className="text-sm text-muted-foreground">for</span>
                        <SkillTag variant="wanted" size="sm">
                          {swap.skillWanted}
                        </SkillTag>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Completed: {new Date(swap.completedDate).toLocaleDateString()}
                        </span>
                        
                        {!swap.myRating ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Rate this swap:</span>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  onClick={() => handleRateUser(swap.id, rating)}
                                  className="hover:scale-110 transition-transform"
                                >
                                  <Star className="h-4 w-4 text-gray-300 hover:text-yellow-400" />
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-muted-foreground">Your rating:</span>
                            <div className="flex">
                              {[...Array(swap.myRating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
