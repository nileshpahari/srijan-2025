'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, MessageSquare, Users, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUsers, User } from '@/hooks/useUsers';
import { useConversations } from '@/hooks/useConversations';
import { useGemini } from '@/hooks/useGemini';

export default function SkillSync() {
  const router = useRouter();
  const { user } = useAuth();
  const { users, loading: usersLoading, searchUsers } = useUsers();
  const { createConversation } = useConversations();
  const { suggestions, loading: geminiLoading, generateSuggestions } = useGemini();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [geminiDialogOpen, setGeminiDialogOpen] = useState(false);
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  useEffect(() => {
    // Initial search to populate the page
    if (user) {
      searchUsers('');
    }
  }, [user]);

  const handleSearch = () => {
    searchUsers(searchQuery);
  };

  const handleGeminiSubmit = async () => {
    if (!geminiPrompt.trim()) return;
    await generateSuggestions(geminiPrompt);
  };

  const startDirectMessage = async (targetUser: User) => {
    if (!user) return;
    
    try {
      setIsCreatingConversation(true);
      const conversation = await createConversation(
        targetUser.fullName,
        'individual',
        [targetUser.email]
      );
      
      router.push(`/chat/${conversation._id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const createGroup = async () => {
    if (!user || !groupName.trim() || selectedUsers.length === 0) return;
    
    try {
      setIsCreatingConversation(true);
      const participants = selectedUsers.map(u => u.email);
      
      const conversation = await createConversation(
        groupName,
        'group',
        participants
      );
      
      setCreateGroupDialogOpen(false);
      setGroupName('');
      setSelectedUsers([]);
      router.push(`/chat/${conversation._id}`);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const toggleUserSelection = (targetUser: User) => {
    if (selectedUsers.some(u => u._id === targetUser._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== targetUser._id));
    } else {
      setSelectedUsers([...selectedUsers, targetUser]);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to use SkillSync</h2>
          <Button onClick={() => router.push('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Tabs Section */}
        <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="glass w-full grid grid-cols-2 h-14">
            <TabsTrigger value="search" className="text-lg">
              <Search className="w-5 h-5 mr-2" />
              Search Talents
            </TabsTrigger>
            <TabsTrigger value="gemini" className="text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              Gemini Matching
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-6">
            {/* Search Section */}
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 mb-8">
              <h1 className="text-3xl font-bold mb-6">Find Your Perfect Team</h1>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search by skills (e.g., React, Python, AWS)"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>

            {/* Popular Skills */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Popular Skills</h2>
              <div className="flex flex-wrap gap-2">
                {['React', 'Python', 'Node.js', 'TypeScript', 'AWS', 'Docker'].map(
                  (skill) => (
                    <Button
                      key={skill}
                      variant="outline"
                      className="backdrop-blur-sm bg-white/5"
                      onClick={() => {
                        setSearchQuery(skill);
                        handleSearch();
                      }}
                    >
                      {skill}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Create Group Button */}
            <div className="mb-8">
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => setCreateGroupDialogOpen(true)}
              >
                <Users className="w-5 h-5 mr-2" />
                Create Group
              </Button>
            </div>

            {/* User Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usersLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <Card
                    key={user._id}
                    className="backdrop-blur-md bg-white/10 border-white/20 p-6 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} 
                          alt={user.fullName} 
                          className="rounded-full" 
                        />
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.fullName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {user.branch === 'cs' ? 'Computer Science' :
                           user.branch === 'it' ? 'Information Technology' :
                           user.branch === 'ee' ? 'Electrical Engineering' :
                           user.branch === 'me' ? 'Mechanical Engineering' :
                           user.branch === 'design' ? 'Design' : user.branch}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{user.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {user.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {user.skills.length > 4 && (
                        <Badge variant="outline">+{user.skills.length - 4}</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/profile/${user._id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                      <Button 
                        size="sm"
                        onClick={() => startDirectMessage(user)}
                        disabled={isCreatingConversation}
                      >
                        {isCreatingConversation ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <MessageSquare className="w-4 h-4 mr-2" />
                        )}
                        Message
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-xl text-gray-400">No users found matching your search criteria</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="Ai based" className="mt-6">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Sparkles className="w-10 h-10 text-purple-400" />
                <h1 className="text-3xl font-bold">Gemini Team Matching</h1>
              </div>
              
              <p className="text-gray-300 mb-6">
                Describe your project idea and the skills you're looking for, and our AI will help you find the perfect team members.
              </p>
              
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe your project and the skills you need... (e.g., I'm building a mobile app for fitness tracking and need a React Native developer and a UI/UX designer)"
                  className="h-32 bg-white/5"
                  value={geminiPrompt}
                  onChange={(e) => setGeminiPrompt(e.target.value)}
                />
                
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={handleGeminiSubmit}
                  disabled={geminiLoading || !geminiPrompt.trim()}
                >
                  {geminiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating Suggestions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Suggestions
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Suggestions Display */}
            {suggestions && (
              <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
                <h2 className="text-xl font-semibold mb-4">Team Suggestions</h2>
                <div className="prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: suggestions.replace(/\n/g, '<br />') }} />
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Group Dialog */}
      <Dialog open={createGroupDialogOpen} onOpenChange={setCreateGroupDialogOpen}>
        <DialogContent className="backdrop-blur-md bg-white/10 border-white/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Group</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Group Name</label>
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select Members</label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {users.map((user) => (
                  <div 
                    key={user._id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                      selectedUsers.some(u => u._id === user._id) 
                        ? 'bg-purple-500/30' 
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => toggleUserSelection(user)}
                  >
                    <Avatar className="w-8 h-8">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                        alt={user.fullName} 
                        className="rounded-full" 
                      />
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              <p className="w-full text-sm font-medium mb-1">Selected ({selectedUsers.length}):</p>
              {selectedUsers.map((user) => (
                <Badge
                  key={user._id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {user.fullName}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCreateGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createGroup}
              disabled={!groupName.trim() || selectedUsers.length === 0 || isCreatingConversation}
            >
              {isCreatingConversation ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gemini Dialog */}
      <Dialog open={geminiDialogOpen} onOpenChange={setGeminiDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-8 right-8 rounded-full w-14 h-14 p-0 bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={() => setGeminiDialogOpen(true)}
          >
            <Sparkles className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="backdrop-blur-md bg-white/10 border-white/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gemini Team Matching</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Describe your project and the skills you need..."
              className="h-32"
              value={geminiPrompt}
              onChange={(e) => setGeminiPrompt(e.target.value)}
            />
            
            <Button 
              className="w-full"
              onClick={handleGeminiSubmit}
              disabled={geminiLoading}
            >
              {geminiLoading ? 'Generating...' : 'Generate Suggestions'}
            </Button>
            
            {suggestions && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg max-h-60 overflow-y-auto">
                <p className="whitespace-pre-line">{suggestions}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}