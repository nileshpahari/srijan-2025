"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { generateQuiz } from "@/app/actions/gemini";
import { useRouter } from "next/navigation";
import { Quiz, User, SkillLevel } from "@/types";

async function getQuiz(skill: string): Promise<Quiz[]> {
  const response: Quiz[] = await generateQuiz(skill);
  return response;
}

export default function QuizForm({
  skill,
  user,
}: {
  skill: string;
  user: User;
}) {
  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
    getQuiz(skill)
      .then((data) => setQuiz(data))
      .catch(() => setQuiz([]))
      .finally(() => setLoading(false));
  }, [skill]);

  if (!user) {
    return null;
  }

  const handleSelect = (index: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [index]: option }));
  };

  const updateSkillLevel = async (score: number): Promise<any> => {
    const updateSkillLevel = async (score: number): Promise<void> => {
      const skillIndex = user.skills.findIndex((s) => s.skillName === skill);
      if (skillIndex === -1) return;

      const newSkillLevel =
        score >= 15
          ? SkillLevel.expert
          : score >= 10
          ? SkillLevel.intermediate
          : SkillLevel.beginner;

      user.skills[skillIndex].skillLevel = newSkillLevel;

      await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ skills: user.skills }),
      });
    };
  };
  
  const handleSubmit = () => {
    let correctCount = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.answer) correctCount++;
    });
    updateSkillLevel(correctCount);
    setScore(correctCount);
  };

  const getBadge = (score: number) => {
    if (score >= 15) return <Badge variant="destructive">Expert 🔴</Badge>;
    if (score >= 10) return <Badge variant="outline">Intermediate 🔵</Badge>;
    return <Badge variant="secondary">Beginner 🟢</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-8">
      <Card className="w-full max-w-2xl p-6 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Quiz - {skill}</h1>

        {loading ? (
          <div className="flex justify-center">
            <div>Fetching questions </div>
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            {quiz.map((q, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-semibold">
                  {index + 1}. {q.question}
                </h3>
                <RadioGroup
                  className="mt-2 space-y-2"
                  onValueChange={(value) => handleSelect(index, value)}
                >
                  {Object.entries(q.options).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <RadioGroupItem
                        value={key}
                        checked={answers[index] === key}
                      />
                      {value}
                    </label>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <Button className="w-full mt-4" onClick={handleSubmit}>
              Submit Quiz
            </Button>

            {score !== null && (
              <div className="text-center mt-6">
                <h2 className="text-xl font-bold">Your Score: {score}/20</h2>
                <p className="mt-2">You earned: {getBadge(score)}</p>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
