export enum SkillLevel {
  beginner = "beginner",
  intermediate = "intermediate",
  expert = "expert",
}

export interface User {
  _id: string;
  email: string;
  fullName: string;
  branch?: string;
  skills: { skillName: string; skillLevel: SkillLevel }[];
  bio?: string;
  linkedin?: string;
  github?: string;
}

export interface Skill {
  skillName: string;
  skillLevel: SkillLevel;
}

export interface Prompt {
  teamDescription: string;
  users: {
    userId: string;
    skills: string[];
  }[];
}

export interface Quiz {
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  answer: string;
}
export interface Message {
  _id?: string;
  sender: string;
  senderEmail: string;
  content: string;
  timestamp: Date;
}

export interface Conversation {
  _id: string;
  name: string;
  type: "individual" | "group";
  participants: string[];
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: Date;
}



