"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QuizForm from "@/components/quizForm";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const skillOptions = [
  "JavaScript",
  "React",
  "Node.js",
  "TypeScript",
  "CSS",
  "MongoDB",
];

export default function TestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const skillOptions = user.skills || [];

  return !started ? (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-8">
      <Card className="w-full max-w-lg p-6 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-4">
          Skill Assessment
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          Take a 20-question multiple-choice test based on your chosen skill.
          Earn a badge based on your score.
        </p>

        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">
            Select a Skill
          </label>
          <Select onValueChange={setSelectedSkill}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a skill" />
            </SelectTrigger>
            <SelectContent>
              {skillOptions.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Test Format</h2>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300">
            <li>20 multiple-choice questions</li>
            <li>Each question has four options (A, B, C, D)</li>
            <li>Only one correct answer per question</li>
            <li>Time limit: 15 minutes</li>
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Scoring & Badges</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">0-5: Beginner 🟢</Badge>
            <Badge variant="outline">6-14: Intermediate 🔵</Badge>
            <Badge variant="destructive">15-20: Expert 🔴</Badge>
          </div>
        </div>

        <Button
          className="w-full"
          disabled={!selectedSkill}
          onClick={() => setStarted(true)}
        >
          {selectedSkill ? `Start Test` : "Select a Skill to Start"}
        </Button>
      </Card>
    </div>
  ) : (
    <QuizForm skill={selectedSkill as string} />
  );
}
