import { User, Skill, Swap, Message, AuthUser, LoginCredentials, RegisterCredentials } from './types';

// Mock data
const mockUsers: User[] = [
  {
    id: 1,
    name: "Alex Chen",
    email: "alex@example.com",
    bio: "Full-stack developer passionate about React and Node.js",
    location: "San Francisco, CA",
    availability: ["Weekends", "Evenings"],
    isPublic: true,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    ratingAvg: 4.8,
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    bio: "UX/UI Designer with 5+ years experience",
    location: "New York, NY",
    availability: ["Weekdays", "Mornings"],
    isPublic: true,
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b02c?w=150&h=150&fit=crop&crop=face",
    ratingAvg: 4.9,
    createdAt: "2024-01-02T00:00:00Z"
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    email: "mike@example.com",
    bio: "Marketing specialist and guitar enthusiast",
    location: "Austin, TX",
    availability: ["Weekends"],
    isPublic: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    ratingAvg: 4.7,
    createdAt: "2024-01-03T00:00:00Z"
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@example.com",
    bio: "Professional photographer and Photoshop expert",
    location: "Seattle, WA",
    availability: ["Weekends", "Evenings"],
    isPublic: false,
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    ratingAvg: 4.9,
    createdAt: "2024-01-04T00:00:00Z"
  }
];

const mockSkills: Skill[] = [
  { id: 1, userId: 1, name: "React Development", type: "OFFER" },
  { id: 2, userId: 1, name: "Node.js", type: "OFFER" },
  { id: 3, userId: 1, name: "Guitar Lessons", type: "WANT" },
  { id: 4, userId: 2, name: "UI/UX Design", type: "OFFER" },
  { id: 5, userId: 2, name: "Figma", type: "OFFER" },
  { id: 6, userId: 2, name: "Web Development", type: "WANT" },
  { id: 7, userId: 3, name: "Digital Marketing", type: "OFFER" },
  { id: 8, userId: 3, name: "Guitar", type: "OFFER" },
  { id: 9, userId: 3, name: "Photography", type: "WANT" },
  { id: 10, userId: 4, name: "Photography", type: "OFFER" },
  { id: 11, userId: 4, name: "Photoshop", type: "OFFER" },
  { id: 12, userId: 4, name: "Video Editing", type: "WANT" }
];

let mockSwaps: Swap[] = [
  {
    id: 1,
    requesterId: 1,
    targetId: 2,
    status: "PENDING",
    requestedAt: "2024-07-10T10:00:00Z"
  },
  {
    id: 2,
    requesterId: 3,
    targetId: 1,
    status: "ACTIVE",
    requestedAt: "2024-07-08T14:00:00Z",
    acceptedAt: "2024-07-08T15:00:00Z"
  }
];

let mockMessages: Message[] = [
  {
    id: 1,
    swapId: 2,
    senderId: 3,
    body: "Hey Alex! Thanks for accepting the swap. When would be a good time for the React lesson?",
    sentAt: "2024-07-08T15:30:00Z"
  },
  {
    id: 2,
    swapId: 2,
    senderId: 1,
    body: "Hi Mike! How about this Saturday at 2 PM? We can do it over video call.",
    sentAt: "2024-07-08T16:00:00Z"
  }
];

// Current authenticated user (mock)
let currentUser: AuthUser | null = null;

// Helper functions
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const generateJWT = (user: AuthUser): string => {
  return btoa(JSON.stringify({ ...user, exp: Date.now() + 24 * 60 * 60 * 1000 }));
};

const validateJWT = (token: string): AuthUser | null => {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return null;
    return { id: payload.id, name: payload.name, email: payload.email, isAdmin: payload.isAdmin };
  } catch {
    return null;
  }
};

// API Functions
export const mockApi = {
  auth: {
    login: async (credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> => {
      await delay();
      
      const user = mockUsers.find(u => u.email === credentials.email);
      if (!user || credentials.password.length < 8) {
        throw new Error('Invalid credentials');
      }

      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.email === 'admin@skillswap.com'
      };

      currentUser = authUser;
      const token = generateJWT(authUser);
      
      return { user: authUser, token };
    },

    register: async (credentials: RegisterCredentials): Promise<{ user: AuthUser; token: string }> => {
      await delay();
      
      if (mockUsers.find(u => u.email === credentials.email)) {
        throw new Error('Email already exists');
      }

      const newUser: User = {
        id: Math.max(...mockUsers.map(u => u.id)) + 1,
        name: credentials.name,
        email: credentials.email,
        bio: "",
        location: "",
        availability: [],
        isPublic: true,
        ratingAvg: 0,
        createdAt: new Date().toISOString()
      };

      mockUsers.push(newUser);

      const authUser: AuthUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      };

      currentUser = authUser;
      const token = generateJWT(authUser);
      
      return { user: authUser, token };
    },

    validateToken: (token: string): AuthUser | null => {
      return validateJWT(token);
    }
  },

  users: {
    getProfile: async (id: number): Promise<User> => {
      await delay();
      const user = mockUsers.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      return user;
    },

    updateProfile: async (id: number, updates: Partial<User>): Promise<User> => {
      await delay();
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex === -1) throw new Error('User not found');
      
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      return mockUsers[userIndex];
    },

    search: async (query: string = '', offset: number = 0): Promise<User[]> => {
      await delay();
      
      const filteredUsers = mockUsers.filter(user => {
        if (!user.isPublic) return false;
        if (!query) return true;
        
        const userSkills = mockSkills.filter(s => s.userId === user.id);
        return userSkills.some(skill => 
          skill.name.toLowerCase().includes(query.toLowerCase())
        ) || user.name.toLowerCase().includes(query.toLowerCase());
      });

      return filteredUsers.slice(offset, offset + 20);
    }
  },

  skills: {
    getByUser: async (userId: number): Promise<Skill[]> => {
      await delay();
      return mockSkills.filter(s => s.userId === userId);
    },

    create: async (skill: Omit<Skill, 'id'>): Promise<Skill> => {
      await delay();
      const newSkill: Skill = {
        ...skill,
        id: Math.max(...mockSkills.map(s => s.id)) + 1
      };
      mockSkills.push(newSkill);
      return newSkill;
    },

    delete: async (id: number): Promise<void> => {
      await delay();
      const index = mockSkills.findIndex(s => s.id === id);
      if (index > -1) {
        mockSkills.splice(index, 1);
      }
    }
  },

  swaps: {
    getByUser: async (userId: number): Promise<Swap[]> => {
      await delay();
      const userSwaps = mockSwaps.filter(s => 
        s.requesterId === userId || s.targetId === userId
      );
      
      // Add user details
      return userSwaps.map(swap => ({
        ...swap,
        requester: mockUsers.find(u => u.id === swap.requesterId),
        target: mockUsers.find(u => u.id === swap.targetId)
      }));
    },

    create: async (swap: Omit<Swap, 'id' | 'requestedAt'>): Promise<Swap> => {
      await delay();
      const newSwap: Swap = {
        ...swap,
        id: Math.max(...mockSwaps.map(s => s.id)) + 1,
        requestedAt: new Date().toISOString()
      };
      mockSwaps.push(newSwap);
      return newSwap;
    },

    updateStatus: async (id: number, status: Swap['status']): Promise<Swap> => {
      await delay();
      const swapIndex = mockSwaps.findIndex(s => s.id === id);
      if (swapIndex === -1) throw new Error('Swap not found');
      
      mockSwaps[swapIndex] = {
        ...mockSwaps[swapIndex],
        status,
        acceptedAt: status === 'ACTIVE' ? new Date().toISOString() : mockSwaps[swapIndex].acceptedAt
      };
      
      return mockSwaps[swapIndex];
    },

    delete: async (id: number): Promise<void> => {
      await delay();
      const index = mockSwaps.findIndex(s => s.id === id);
      if (index > -1) {
        mockSwaps.splice(index, 1);
      }
    }
  },

  messages: {
    getBySwap: async (swapId: number): Promise<Message[]> => {
      await delay();
      const messages = mockMessages.filter(m => m.swapId === swapId);
      
      return messages.map(message => ({
        ...message,
        sender: mockUsers.find(u => u.id === message.senderId)
      }));
    },

    send: async (message: Omit<Message, 'id' | 'sentAt'>): Promise<Message> => {
      await delay();
      const newMessage: Message = {
        ...message,
        id: Math.max(...mockMessages.map(m => m.id)) + 1,
        sentAt: new Date().toISOString()
      };
      mockMessages.push(newMessage);
      return newMessage;
    }
  }
};