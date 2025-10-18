import Spline from '@splinetool/react-spline';
import { useConversation } from '@elevenlabs/react';
import { useState } from 'react';
import { getSignedUrl } from '../../lib/api/elevenlabs';

function Avatar() {
  const [isConnecting, setIsConnecting] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      setIsConnecting(false);
    },
    onDisconnect: () => {
      setIsConnecting(false);
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      setIsConnecting(false);
    },
  });

  const handleTalkToUs = async () => {
    try {
      setIsConnecting(true);

      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL for authentication
      const signedUrl = await getSignedUrl();

      // Start conversation with signed URL
      await conversation.startSession({
        signedUrl,
      });
    } catch (error) {
      setIsConnecting(false);
      console.error('Failed to start conversation:', error);
      alert('Failed to start conversation. Please check your microphone permissions and server configuration.');
    }
  };

  const handleEndConversation = async () => {
    await conversation.endSession();
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[var(--background)]">

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--border) 1px, transparent 1px),
              linear-gradient(90deg, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Red Accent Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-10 blur-[100px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--toyota-red) 0%, transparent 70%)',
          }}
        />

        {/* Avatar Container */}
        <div className="relative h-full flex items-center justify-center p-4">
          <div className="w-full max-w-6xl mx-auto">
            {/* Avatar Frame */}
            <div className="relative w-full">
              {/* Corner Decorations */}
              <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-[var(--toyota-red)] rounded-tl-lg opacity-60 z-10"></div>
              <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-[var(--toyota-red)] rounded-tr-lg opacity-60 z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-2 border-l-2 border-[var(--toyota-red)] rounded-bl-lg opacity-60 z-10"></div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-[var(--toyota-red)] rounded-br-lg opacity-60 z-10"></div>
              
              {/* Main Avatar Container */}
              <div 
                className="relative bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl w-full h-[60vh] min-h-[400px] max-h-[600px]"
                style={{
                  boxShadow: '0 0 40px var(--glass-glow-strong)',
                }}
              >
                <div className="absolute inset-0">
                  <Spline scene="https://prod.spline.design/uFrHM1KSZn46gTnk/scene.splinecode" />
                </div>

                {/* Connection Status Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                    conversation.status === 'connected' 
                      ? 'bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30' 
                      : conversation.status === 'connecting'
                      ? 'bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/30'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      conversation.status === 'connected' 
                        ? 'bg-[var(--success)] animate-pulse' 
                        : conversation.status === 'connecting'
                        ? 'bg-[var(--warning)] animate-pulse'
                        : 'bg-[var(--muted-foreground)]'
                    }`} />
                    {conversation.status === 'connected' ? 'Connected' : 
                     conversation.status === 'connecting' ? 'Connecting...' : 'Disconnected'}
                  </div>
                </div>
              </div>

              {/* Voice Controls */}
              <div className="mt-6 flex justify-center gap-4">
                {conversation.status !== 'connected' ? (
                  <button
                    onClick={handleTalkToUs}
                    disabled={isConnecting || conversation.status === 'connecting'}
                    className="group relative px-8 py-3 bg-[var(--toyota-red)] hover:bg-[var(--toyota-red-dark)] disabled:bg-[var(--toyota-red)]/50 text-[var(--toyota-white)] font-medium rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {isConnecting || conversation.status === 'connecting' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[var(--toyota-white)]/30 border-t-[var(--toyota-white)] rounded-full animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                        Start Conversation
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleEndConversation}
                    className="group relative px-8 py-3 bg-[var(--destructive)] hover:bg-[var(--destructive)]/90 text-[var(--destructive-foreground)] font-medium rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    End Conversation
                  </button>
                )}

                {/* Microphone Status Indicator */}
                {conversation.status === 'connected' && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                    <svg className="w-5 h-5 text-[var(--success)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[var(--muted-foreground)]">Listening...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}

export default Avatar;
