'use client';

import { useEffect, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Trophy, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface UserProfile {
  _id: string;
  fullName: string;
  branch: string;
  skills: string[];
  bio: string;
  linkedin: string;
  github: string;
  hackathons?: {
    name: string;
    position: string;
    project: string;
    description: string;
    team: string[];
  }[];
}

export default function Profile() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authLoading && !user) {
        router.push('/login');
        return;
      }

      if (user) {
        try {
          const response = await fetch('/api/auth/me');
          
          if (response.ok) {
            const data = await response.json();
            setProfile(data);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <Button onClick={() => router.push('/signup')}>Create Profile</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`} 
                alt={profile.fullName} 
                className="rounded-full" 
              />
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{profile.fullName}</h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {profile.branch === 'cs' ? 'Computer Science' :
                     profile.branch === 'it' ? 'Information Technology' :
                     profile.branch === 'ee' ? 'Electrical Engineering' :
                     profile.branch === 'me' ? 'Mechanical Engineering' :
                     profile.branch === 'design' ? 'Design' : profile.branch}
                  </p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
              <div className="flex gap-4">
                {profile.linkedin && (
                  <Link href={profile.linkedin} target="_blank">
                    <Button variant="outline" size="sm">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  </Link>
                )}
                {profile.github && (
                  <Link href={profile.github} target="_blank">
                    <Button variant="outline" size="sm">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Bio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2 backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">Bio</h2>
            <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
          </div>
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Hackathon History */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">Hackathon History</h2>
          {profile.hackathons && profile.hackathons.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {profile.hackathons.map((hackathon, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span>{hackathon.name}</span>
                      <Badge variant="secondary">{hackathon.position}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card className="p-4 bg-white/5">
                      <h3 className="font-semibold mb-2">{hackathon.project}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {hackathon.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Team:</span>
                        {hackathon.team.map((member, i) => (
                          <Badge key={i} variant="outline">
                            {member}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">No hackathon history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}