'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Code2, Users2, MessageSquare, Trophy, Sparkles, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    width: number;
    height: number;
    top: number;
    left: number;
    background: string;
    duration: number;
  }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      width: Math.random() * 4,
      height: Math.random() * 4,
      top: Math.random() * 100,
      left: Math.random() * 100,
      background: `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, ${Math.random() * 0.5 + 0.2})`,
      duration: Math.random() * 10 + 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-black to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full animate-float"
              style={{
                width: `${particle.width}px`,
                height: `${particle.height}px`,
                top: `${particle.top}%`,
                left: `${particle.left}%`,
                background: particle.background,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">
          <div className="animate-float">
            <Sparkles className="w-16 h-16 mx-auto text-purple-500 mb-6" />
          </div>
          <h1 className="text-7xl font-bold mb-6 gradient-text">
            Build Your Dream Team
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect with talented developers, designers, and creators. Find the perfect teammates for your next hackathon project.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 animate-glow">
                Get Started <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/skillsync">
              <Button size="lg" variant="outline" className="glass glass-hover">
                Explore Talents
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass glass-hover rounded-2xl p-8">
            <Code2 className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-4 gradient-text">Smart Matching</h3>
            <p className="text-gray-300">
              Our AI-powered system matches you with teammates based on complementary skills and shared interests.
            </p>
          </div>
          <div className="glass glass-hover rounded-2xl p-8">
            <Users2 className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-4 gradient-text">Team Building</h3>
            <p className="text-gray-300">
              Create or join teams seamlessly. Find the perfect balance of skills for your project.
            </p>
          </div>
          <div className="glass glass-hover rounded-2xl p-8">
            <MessageSquare className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-4 gradient-text">Real-time Chat</h3>
            <p className="text-gray-300">
              Collaborate effectively with built-in messaging and team communication tools.
            </p>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass glass-hover rounded-2xl p-8">
            <Trophy className="w-8 h-8 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">HackTech 2025 Winners</h3>
            <p className="text-gray-300">
              "SkillSync helped us form the perfect team. We won first place with our AI-powered sustainability project!"
            </p>
          </div>
          <div className="glass glass-hover rounded-2xl p-8">
            <Rocket className="w-8 h-8 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Global Code Fest Champions</h3>
            <p className="text-gray-300">
              "Found amazing teammates through SkillSync. Our diverse skills led us to create an innovative healthcare solution."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}