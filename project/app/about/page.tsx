import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Heart, 
  Lightbulb, 
  Users, 
  Award, 
  TrendingUp,
  Globe,
  Shield
} from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for the highest quality in AI tutoring technology and educational outcomes.'
    },
    {
      icon: Heart,
      title: 'Accessibility',
      description: 'Making quality education accessible to everyone, regardless of background or location.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Continuously advancing AI technology to create better learning experiences.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a supportive learning community where everyone can thrive.'
    }
  ];

  const stats = [
    { number: '500K+', label: 'Students Helped' },
    { number: '50+', label: 'Subjects Covered' },
    { number: '98%', label: 'Satisfaction Rate' },
    { number: '24/7', label: 'Support Available' }
  ];

  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'CEO & Co-Founder',
      description: 'Former Stanford AI researcher with 15 years in educational technology.',
      expertise: ['AI/ML', 'Education', 'Leadership']
    },
    {
      name: 'Prof. Michael Rodriguez',
      role: 'Chief Learning Officer',
      description: 'Educational psychology expert and former university dean.',
      expertise: ['Psychology', 'Curriculum', 'Assessment']
    },
    {
      name: 'Dr. Aisha Patel',
      role: 'Head of AI Research',
      description: 'PhD in Machine Learning, specializing in natural language processing.',
      expertise: ['NLP', 'Deep Learning', 'Research']
    },
    {
      name: 'James Kim',
      role: 'Head of Product',
      description: 'Former Google product manager with expertise in educational platforms.',
      expertise: ['Product', 'UX', 'Strategy']
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About AITutor</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing education through AI-powered personalized tutoring, 
            making quality learning accessible to everyone, everywhere.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8 mb-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              To democratize quality education by providing personalized, AI-powered tutoring that adapts to each learner's unique needs, 
              pace, and learning style. We believe that everyone deserves access to exceptional education, 
              regardless of their geographical location or economic circumstances.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Technology</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
                <Lightbulb className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced AI Models</h3>
              <p className="text-muted-foreground">
                State-of-the-art machine learning models trained on vast educational datasets
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Adaptive Learning</h3>
              <p className="text-muted-foreground">
                Personalized learning paths that adapt in real-time to student progress
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security ensuring student data privacy and protection
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <CardTitle>{member.name}</CardTitle>
                      <CardDescription className="text-primary font-medium">
                        {member.role}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{member.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Global Impact */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Global Impact</h2>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8">
            <div className="flex items-center justify-center mb-4">
              <Globe className="h-12 w-12 text-primary" />
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              AITutor is currently serving students in over 50 countries, 
              breaking down barriers to quality education and empowering learners worldwide. 
              Our mission is to make personalized, high-quality education a reality for every student, 
              regardless of their location or circumstances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}