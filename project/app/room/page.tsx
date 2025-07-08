'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  MessageSquare,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Settings,
  PhoneOff,
  Send,
  Volume2,
  VolumeX
} from 'lucide-react';

// LiveKit imports
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  useParticipants,
  useLocalParticipant,
  ParticipantTile,
  VideoTrack,
  AudioTrack,
  useTracks,
  useRoomContext,
  useChat
} from '@livekit/components-react';
import { Track, ConnectionState, Room } from 'livekit-client';

import { PermissionChecker } from '@/features/video-room/components/PermissionChecker';
import { SessionData, Message } from '@/types';
import { StorageService, STORAGE_KEYS } from '@/utils/storage';

// Settings Modal Component
function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Session Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Video Quality</span>
            <select className="border rounded px-2 py-1">
              <option>HD (720p)</option>
              <option>Full HD (1080p)</option>
              <option>Auto</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span>Audio Quality</span>
            <select className="border rounded px-2 py-1">
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span>Background Blur</span>
            <input type="checkbox" className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <span>Noise Cancellation</span>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}

// Custom Room Component with enhanced layout
function CustomVideoRoom({ sessionData }: { sessionData: SessionData }) {
  const router = useRouter();
  const room = useRoomContext();
  const { send: sendChatMessage, chatMessages } = useChat();
  
  // Get participants and tracks
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: false });

  // Get remote participants (excluding local participant)
  const remoteParticipants = participants.filter(p => p !== localParticipant);

  // Get local video track
  const localVideoTrack = tracks.find(
    (trackRef) => trackRef.participant === localParticipant && trackRef.source === Track.Source.Camera
  );

  // Local state for controls
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Chat state - combine LiveKit chat with local messages
  const [localMessages, setLocalMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Welcome to your AI tutoring session! I'm here to help you learn. What would you like to work on today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, chatMessages]);

  // Update local participant states when tracks change
  useEffect(() => {
    if (localParticipant) {
      setIsCameraOn(localParticipant.isCameraEnabled);
      setIsMicOn(localParticipant.isMicrophoneEnabled);
      setIsScreenSharing(localParticipant.isScreenShareEnabled);
    }
  }, [localParticipant?.isCameraEnabled, localParticipant?.isMicrophoneEnabled, localParticipant?.isScreenShareEnabled]);

  const leaveSession = () => {
    StorageService.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    console.log('🚪 Leaving session...');
    router.push('/services');
  };

  // Control functions
  const toggleCamera = async () => {
    if (localParticipant) {
      try {
        await localParticipant.setCameraEnabled(!isCameraOn);
        setIsCameraOn(!isCameraOn);
      } catch (error) {
        console.error('Failed to toggle camera:', error);
      }
    }
  };

  const toggleMicrophone = async () => {
    if (localParticipant) {
      try {
        await localParticipant.setMicrophoneEnabled(!isMicOn);
        setIsMicOn(!isMicOn);
      } catch (error) {
        console.error('Failed to toggle microphone:', error);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (localParticipant) {
      try {
        await localParticipant.setScreenShareEnabled(!isScreenSharing);
        setIsScreenSharing(!isScreenSharing);
      } catch (error) {
        console.error('Failed to toggle screen share:', error);
      }
    }
  };

  // Chat functions
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add to local messages
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setLocalMessages(prev => [...prev, message]);
    
    // Send via LiveKit chat if available
    if (sendChatMessage) {
      sendChatMessage(newMessage);
    }
    
    setNewMessage('');
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `I understand you said "${newMessage}". Let me help you with that. What specific aspect would you like to explore further?`,
        sender: 'ai',
        timestamp: new Date()
      };
      setLocalMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get participant display name
  const getParticipantDisplayName = (participant: any) => {
    // Check for specific participant names
    if (participant.identity === 'deepak' || participant.name === 'Deepak') {
      return 'Deepak';
    }
    
    // Use participant name or identity, fallback to generic names
    return participant.name || participant.identity || 'Participant';
  };

  // Get local participant name
  const localParticipantName = localParticipant ? getParticipantDisplayName(localParticipant) : 'You';

  return (
    <div className="h-screen bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">
            AI Tutor - {sessionData.session.subject} Session
          </h1>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Room: {sessionData.room.roomName}
          </span>
          <Button 
            variant="destructive" 
            onClick={leaveSession}
            className="bg-red-500 hover:bg-red-600"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            Leave Session
          </Button>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="h-[calc(100vh-80px)] flex">
        {/* Left Side - Video Area */}
        <div className="flex-1 p-4">
          <div className="h-full flex flex-col">
            {/* Top Section - Main Video Area (Reduced Height) */}
            <div className="h-[55%] mb-4">
              <div className="h-full bg-gray-900 rounded-lg relative overflow-hidden">
                {/* Main webcam area label with participant name */}
                <div className="absolute top-4 left-4 text-white font-medium text-lg z-10 bg-black/50 px-3 py-1 rounded">
                  {localParticipantName}
                </div>

                {/* Local participant video - fill the entire main area */}
                {localParticipant && localVideoTrack && isCameraOn ? (
                  <div className="absolute inset-0 w-full h-full">
                    <VideoTrack
                      trackRef={localVideoTrack}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  /* Camera off placeholder */
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <VideoOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <span className="text-gray-400 text-2xl font-semibold">
                        Camera Off
                      </span>
                    </div>
                  </div>
                )}

                {/* Modern Webcam Controls Overlay */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl border border-white/10">
                    {/* Camera Toggle */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleCamera}
                      className={`w-12 h-12 rounded-full p-0 transition-all duration-200 ${
                        isCameraOn 
                          ? 'bg-white/20 text-white hover:bg-white/30' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                      title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                    >
                      {isCameraOn ? (
                        <Video className="h-5 w-5" />
                      ) : (
                        <VideoOff className="h-5 w-5" />
                      )}
                    </Button>

                    {/* Microphone Toggle */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleMicrophone}
                      className={`w-12 h-12 rounded-full p-0 transition-all duration-200 ${
                        isMicOn 
                          ? 'bg-white/20 text-white hover:bg-white/30' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                      title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
                    >
                      {isMicOn ? (
                        <Mic className="h-5 w-5" />
                      ) : (
                        <MicOff className="h-5 w-5" />
                      )}
                    </Button>

                    {/* Screen Share Toggle */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleScreenShare}
                      className={`w-12 h-12 rounded-full p-0 transition-all duration-200 ${
                        isScreenSharing 
                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
                    >
                      {isScreenSharing ? (
                        <MonitorOff className="h-5 w-5" />
                      ) : (
                        <Monitor className="h-5 w-5" />
                      )}
                    </Button>

                    {/* Settings Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowSettings(true)}
                      className="w-12 h-12 rounded-full p-0 bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
                      title="Open settings"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Remote participants area - Only show when participants are connected */}
                {remoteParticipants.length > 0 && (
                  <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden z-10 border-2 border-blue-400">
                    <div className="absolute top-2 left-2 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                      {getParticipantDisplayName(remoteParticipants[0])}
                    </div>
                    {(() => {
                      const participant = remoteParticipants[0];
                      const remoteVideoTrack = tracks.find(
                        (trackRef) => trackRef.participant === participant && trackRef.source === Track.Source.Camera
                      );

                      if (remoteVideoTrack) {
                        return (
                          <VideoTrack
                            trackRef={remoteVideoTrack}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        );
                      } else {
                        return (
                          <div className="flex items-center justify-center w-full h-full">
                            <div className="text-center">
                              <VideoOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <span className="text-gray-400 text-xs">Camera Off</span>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section - Enhanced Chat Area (Increased Height) */}
            <div className="h-[45%] bg-gray-800 rounded-lg p-4">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Chat</h3>
                  <div className="text-xs text-gray-400">
                    {localMessages.length + chatMessages.length} messages
                  </div>
                </div>
                
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
                  {/* Local messages */}
                  {localMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-700 text-white rounded-bl-sm'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* LiveKit chat messages */}
                  {chatMessages.map((message, index) => (
                    <div key={index} className="flex justify-start">
                      <div className="max-w-[80%] p-3 rounded-lg bg-purple-600 text-white rounded-bl-sm">
                        <div className="text-xs opacity-70 mb-1">{message.from?.name || 'Participant'}</div>
                        <p className="text-sm">{message.message}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Enhanced Chat input */}
                <div className="flex items-center gap-2">
                  <div className="bg-gray-700 rounded-full p-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything..."
                    className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 text-sm border-none outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Whiteboard */}
        <div className="w-1/2 p-4">
          <div className="h-full bg-black rounded-lg flex flex-col">
            {/* Whiteboard Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-white text-lg font-semibold">White Board</h2>
              <div className="flex items-center gap-2">
                {/* Whiteboard tools */}
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700 p-2" title="Pen">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700 p-2" title="Rectangle">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" strokeWidth="2" fill="none"/>
                  </svg>
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700 p-2" title="Rounded Rectangle">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" fill="none"/>
                  </svg>
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700 p-2" title="Circle">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" fill="none"/>
                  </svg>
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700 p-2" title="Text">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </Button>
                <div className="w-px h-6 bg-gray-600 mx-2"></div>
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700 p-2" title="Undo">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700 p-2" title="Redo">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                  </svg>
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-gray-700" title="Clear All">
                  Clear
                </Button>
              </div>
            </div>
            
            {/* Whiteboard Canvas */}
            <div className="flex-1 relative overflow-hidden">
              <canvas
                width={800}
                height={600}
                className="w-full h-full cursor-crosshair"
                style={{ background: '#000000' }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white/30 text-2xl font-semibold">
                  Draw here...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Audio Renderer for LiveKit */}
      <RoomAudioRenderer />
      <StartAudio label="Click to enable audio" />
    </div>
  );
}

export default function RoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomName = searchParams.get('roomName');
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    console.log('🔍 Room page mounted, checking session data...');
    
    const storedSessionData = StorageService.getItem<SessionData>(STORAGE_KEYS.CURRENT_SESSION);
    if (storedSessionData) {
      try {
        console.log('📱 Session data loaded:', storedSessionData);
        setSessionData(storedSessionData);
        
        if (!storedSessionData.token || !storedSessionData.room || !storedSessionData.serverUrl) {
          console.error('❌ Invalid session data structure');
          setConnectionError('Invalid session data. Please start a new session.');
          setIsConnecting(false);
          return;
        }
        
        setTimeout(() => {
          setIsConnecting(false);
          console.log('✅ Ready to connect to LiveKit room:', storedSessionData.room.roomName);
        }, 1000);
        
      } catch (error) {
        console.error('❌ Failed to parse session data:', error);
        setConnectionError('Invalid session data');
        setIsConnecting(false);
      }
    } else {
      console.error('❌ No session data found in localStorage');
      setConnectionError('No session data found. Please start a new session.');
      setIsConnecting(false);
    }
  }, [roomName]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionData && permissionsGranted) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave the session?';
        return 'Are you sure you want to leave the session?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionData, permissionsGranted]);

  if (isConnecting) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Connecting to your session...</h2>
            <p className="text-muted-foreground">
              {roomName ? `Joining room: ${roomName}` : 'Setting up your tutoring session'}
            </p>
            <div className="text-sm text-muted-foreground">
              Please wait while we prepare your video session...
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (connectionError || !sessionData) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-semibold">Session Error</h2>
            <p className="text-muted-foreground">{connectionError}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/services')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Services
              </Button>
              <Button onClick={() => {
                StorageService.removeItem(STORAGE_KEYS.CURRENT_SESSION);
                router.push('/services');
              }}>
                Start New Session
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!permissionsGranted) {
    return <PermissionChecker onPermissionsGranted={() => setPermissionsGranted(true)} />;
  }

  return (
    <div className="lk-room-container">
      <LiveKitRoom
        video={true}
        audio={true}
        token={sessionData.token}
        serverUrl={sessionData.serverUrl}
        data-lk-theme="default"
        style={{ height: '100vh' }}
        onConnected={() => {
          try {
            console.log('✅ Connected to LiveKit room');
          } catch (error) {
            console.error('❌ Error in onConnected handler:', error);
          }
        }}
        onDisconnected={(reason) => {
          try {
            console.log('🔌 Disconnected from LiveKit room', reason ? `(${reason})` : '');
            StorageService.removeItem(STORAGE_KEYS.CURRENT_SESSION);
            router.push('/services');
          } catch (error) {
            console.error('❌ Error in onDisconnected handler:', error);
            router.push('/services');
          }
        }}
        onError={(error) => {
          try {
            console.error('❌ LiveKit room error:', error);
          } catch (handlerError) {
            console.error('❌ Error in error handler:', handlerError);
          }
        }}
      >
        <CustomVideoRoom sessionData={sessionData} />
      </LiveKitRoom>
    </div>
  );
}