'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, 
  Plus, 
  Users, 
  BookOpen,
  Calculator,
  Atom,
  Globe,
  Code,
  Palette,
  Music,
  TrendingUp,
  Brain,
  Zap,
  Play,
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLiveKit } from '@/hooks/useLiveKit';
import { StorageService, STORAGE_KEYS } from '@/utils/storage';

export default function Services() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { createRoom, generateToken, isLoading, error } = useLiveKit();
  const [startingSession, setStartingSession] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>('');

  // Available AI Tutoring Sessions
  const availableSessions = [
    {
      id: 'math-calculus',
      subject: 'Advanced Calculus',
      tutor: 'Dr. MathBot Pro',
      avatar: '🤖',
      description: 'Master derivatives, integrals, and advanced calculus concepts',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'chemistry-organic',
      subject: 'Organic Chemistry',
      tutor: 'Prof. ChemBot',
      avatar: '🧪',
      description: 'Explore organic compounds, reactions, and molecular structures',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'spanish-conversation',
      subject: 'Spanish Conversation',
      tutor: 'Señora LinguaBot',
      avatar: '🗣️',
      description: 'Practice Spanish speaking and improve your fluency',
      color: 'from-purple-500 to-violet-500'
    },
    {
      id: 'react-development',
      subject: 'React Development',
      tutor: 'CodeMentor AI',
      avatar: '💻',
      description: 'Learn modern React development and best practices',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'digital-design',
      subject: 'Digital Design Basics',
      tutor: 'ArtisticAI',
      avatar: '🎨',
      description: 'Create stunning digital designs and learn design principles',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'music-theory',
      subject: 'Music Theory Fundamentals',
      tutor: 'MusicBot Maestro',
      avatar: '🎵',
      description: 'Understand music theory, scales, and composition',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'physics-quantum',
      subject: 'Quantum Physics',
      tutor: 'Dr. QuantumBot',
      avatar: '⚛️',
      description: 'Dive into quantum mechanics and modern physics',
      color: 'from-teal-500 to-blue-500'
    },
    {
      id: 'literature-analysis',
      subject: 'Literature Analysis',
      tutor: 'Prof. LitBot',
      avatar: '📚',
      description: 'Analyze classic and modern literature with expert guidance',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const handleStartSession = async (session: any) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setStartingSession(session.id);
    setSessionStatus('Initializing session...');

    try {
      console.log('🚀 Starting session for:', session.subject);
      setSessionStatus('Creating room...');

      // Create a room for this session
      const room = await createRoom({
        subject: session.subject,
        tutorType: session.tutor,
        maxParticipants: 2
      });

      console.log('✅ Room created:', room);
      setSessionStatus('Generating access token...');

      // Generate token for the student
      const tokenData = await generateToken({
        roomName: room.roomName,
        role: 'student'
      });

      console.log('✅ Token generated, preparing session...');
      setSessionStatus('Preparing session...');

      // Store session data in localStorage for the room page
      const sessionData = {
        room: room,
        token: tokenData.token,
        participant: tokenData.participant,
        session: session,
        serverUrl: tokenData.room.serverUrl
      };

      StorageService.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionData);
      
      setSessionStatus('Redirecting to session...');

      // Navigate to room page immediately - don't wait
      console.log('🎯 Navigating to room page...');
      router.push(`/room?roomName=${room.roomName}`);

    } catch (error) {
      console.error('❌ Failed to start session:', error);
      setSessionStatus('');
      // Error is handled by the useLiveKit hook
    } finally {
      // Don't clear the starting session state immediately to prevent UI flicker
      setTimeout(() => {
        setStartingSession(null);
        setSessionStatus('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Start Your AI Tutoring Session
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12">
              Experience personalized 1-on-1 tutoring with expert AI tutors across various subjects
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mb-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Subjects Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">AI Tutors Online</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1-on-1</div>
                <div className="text-sm text-muted-foreground">Personal Sessions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Session Status */}
      {sessionStatus && (
        <div className="container mx-auto px-4 py-4">
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Session Status:</strong> {sessionStatus}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Available Sessions */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Choose Your Subject</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start a personalized 1-on-1 session with an expert AI tutor
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableSessions.map((session) => (
              <Card 
                key={session.id} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${session.color} flex items-center justify-center text-xl shadow-lg`}>
                      {session.avatar}
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg mb-1">{session.subject}</CardTitle>
                  <CardDescription className="text-sm">
                    with {session.tutor}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">
                    {session.description}
                  </p>
                  
                  {/* Action Button */}
                  <Button 
                    onClick={() => handleStartSession(session)}
                    disabled={isLoading || startingSession === session.id}
                    className={`w-full bg-gradient-to-r ${session.color} hover:opacity-90 transition-all duration-300 group-hover:scale-105`}
                    size="lg"
                  >
                    {startingSession === session.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting Session...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Session
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Custom Session CTA */}
          <div className="text-center mt-12">
            <Card className="max-w-md mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-2 border-dashed border-indigo-200 dark:border-gray-600">
              <CardContent className="p-0">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                    <Plus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Need a Different Subject?</h3>
                  <p className="text-muted-foreground text-center text-sm">
                    Request a custom tutoring session for any subject
                  </p>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Request Custom Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose AI Tutoring?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience personalized learning with cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>1-on-1 Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get personalized attention with dedicated AI tutors focused solely on your learning
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                  <Brain className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Adaptive Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  AI adapts to your learning style and pace for optimal understanding and retention
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit">
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Instant Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Receive immediate feedback and explanations to accelerate your learning progress
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of students who have improved their understanding with AI tutoring
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Zap className="mr-2 h-5 w-5" />
              Start Session Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <BookOpen className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}