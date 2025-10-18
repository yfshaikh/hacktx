import Spline from '@splinetool/react-spline';
import { useConversation } from '@elevenlabs/react';
import { useState, useRef, useEffect } from 'react';
import { getSignedUrl } from '../../lib/api/elevenlabs';
import { CarSidebar } from '../../components/CarSidebar';
import type { VehicleScore } from '../../lib/types';

function Avatar() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [carData, setCarData] = useState<VehicleScore | null>(null);
  const [isCarSidebarOpen, setIsCarSidebarOpen] = useState(false);
  const splineRef = useRef<any>(null);

  function onLoad(splineApp: any) {
    splineRef.current = splineApp;
    console.log('Spline app loaded:', splineApp);
    
    // Trigger idle animation on load (if you have an object named 'Avatar' with 'start' event)
    triggerAnimation('start', 'Avatar');
  }

  // Function to trigger Spline animations using emitEvent
  const triggerAnimation = (eventType: string, objectName: string) => {
    if (splineRef.current) {
      try {
        // Use Spline's emitEvent to trigger animations
        splineRef.current.emitEvent(eventType, objectName);
        console.log(`Triggered ${eventType} event on object: ${objectName}`);
      } catch (error) {
        console.error(`Failed to trigger ${eventType} on ${objectName}:`, error);
      }
    }
  };

  // Create client tool for displaying car information
  const displayCarInfo = (parameters: any) => {
    console.log('displayCarInfo called with parameters:', parameters);
    
    try {
      // Parse the car data from the parameters
      const carInfo = JSON.parse(parameters.carData);
      
      // Create a VehicleScore object from the provided data
      const vehicleScore: VehicleScore = {
        vehicleId: carInfo.vehicleId || carInfo.id || 'temp-id',
        vehicle: {
          id: carInfo.id || carInfo.vehicleId || null,
          make: carInfo.make || null,
          model: carInfo.model || null,
          year: carInfo.year?.toString() || null, // year is string in your schema
          msrp: carInfo.msrp || null,
          fuelType: carInfo.fuelType || null,
          transmission: carInfo.transmission || null,
          colorCodes: carInfo.colorCodes || null,
          colorHexCodes: carInfo.colorHexCodes || null,
          modelTag: carInfo.modelTag || null,
          modelGrade: carInfo.modelGrade || null,
          imageCount: carInfo.imageCount || 36,
          url: carInfo.url || null,
          // Include additional useful fields from your schema
          cylinders: carInfo.cylinders || null,
          engineDisplacement: carInfo.engineDisplacement || null,
          drive: carInfo.drive || null,
          vehicleSizeClass: carInfo.vehicleSizeClass || null,
          cityMpgForFuelType1: carInfo.cityMpgForFuelType1 || null,
          combinedMpgForFuelType1: carInfo.combinedMpgForFuelType1 || null,
          highwayMpgForFuelType1: carInfo.highwayMpgForFuelType1 || null,
          has3D: carInfo.has3D || null,
          colorNames: carInfo.colorNames || null,
        },
        totalScore: carInfo.totalScore || 85,
        confidenceScore: carInfo.confidenceScore || 90,
        factors: {
          vehicleTypeMatch: carInfo.factors?.vehicleTypeMatch || 85,
          priceCompatibility: carInfo.factors?.priceCompatibility || 80,
          featureAlignment: carInfo.factors?.featureAlignment || 90,
          passengerFit: carInfo.factors?.passengerFit || 85,
          fuelTypeMatch: carInfo.factors?.fuelTypeMatch || 95,
          usageCompatibility: carInfo.factors?.usageCompatibility || 80,
          locationFactor: carInfo.factors?.locationFactor || 90,
        },
        metadata: {
          matchingFeatures: carInfo.metadata?.matchingFeatures || ['Safety Features', 'Fuel Efficiency', 'Technology'],
          missingFeatures: carInfo.metadata?.missingFeatures || [],
          featureNotes: carInfo.metadata?.featureNotes || [],
          priceAnalysis: {
            isWithinBudget: carInfo.metadata?.priceAnalysis?.isWithinBudget ?? true,
            percentageFromBudget: carInfo.metadata?.priceAnalysis?.percentageFromBudget || 0,
          },
          passengerAnalysis: carInfo.metadata?.passengerAnalysis || {
            actualCapacity: 5,
            configuration: 'Standard',
            notes: 'Comfortable seating for 5 passengers'
          },
          usageAnalysis: carInfo.metadata?.usageAnalysis || ['Daily commuting', 'Family trips'],
        },
      };

      setCarData(vehicleScore);
      setIsCarSidebarOpen(true);
      
      // Return success message for the conversation context
      return 'Car information displayed successfully';
    } catch (error) {
      console.error('Error parsing car data:', error);
      return 'Failed to display car information';
    }
  };

  // Register client tools properly according to ElevenLabs documentation
  const clientTools = {
    displayCarInfo: displayCarInfo
  };

  const conversation = useConversation({
    clientTools: clientTools,
    onConnect: () => {
      setIsConnecting(false);
      // Trigger listening animation when connected
      triggerAnimation('mouseHover', 'Avatar'); // or use 'start' if you prefer
    },
    onDisconnect: () => {
      setIsConnecting(false);
      // Return to idle state
      triggerAnimation('start', 'Avatar');
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      setIsConnecting(false);
      // Return to idle on error
      triggerAnimation('start', 'Avatar');
    },
    onModeChange: (mode) => {
      console.log('Conversation mode changed:', mode);
      // Mode will be 'speaking' when agent is talking, 'listening' when waiting for user
      
      // Trigger animations based on conversation mode
      if (mode.mode === 'speaking') {
        triggerAnimation('mouseDown', 'Avatar'); // Speaking animation
      } else if (mode.mode === 'listening') {
        triggerAnimation('mouseHover', 'Avatar'); // Listening animation
      }
    },
  });

  // Effect to handle conversation status changes for more responsive animations
  useEffect(() => {
    if (conversation.status === 'connected') {
      if (conversation.isSpeaking) {
        console.log("SPEAKING")
        console.log("==============================")
        triggerAnimation('mouseDown', 'Avatar'); // Speaking
      } else {
        triggerAnimation('mouseHover', 'Avatar'); // Listening
      }
    } else if (conversation.status === 'connecting') {
      triggerAnimation('keyDown', 'Avatar'); // Thinking/connecting
    } else {
      triggerAnimation('start', 'Avatar'); // Idle
    }
  }, [conversation.status, conversation.isSpeaking]);

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
      <main className={`flex-1 relative overflow-hidden transition-all duration-300 ${
        isCarSidebarOpen ? 'pr-96' : ''
      }`}>
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
                  <Spline scene="https://prod.spline.design/uFrHM1KSZn46gTnk/scene.splinecode" onLoad={onLoad} />
                </div>

                {/* Connection Status Badge */}
                <div className="absolute top-4 right-4 z-20">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${
                    conversation.status === 'connected' 
                      ? conversation.isSpeaking
                        ? 'bg-[var(--toyota-red)]/20 text-[var(--toyota-red)] border border-[var(--toyota-red)]/30'
                        : 'bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30'
                      : conversation.status === 'connecting'
                      ? 'bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/30'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      conversation.status === 'connected' 
                        ? conversation.isSpeaking
                          ? 'bg-[var(--toyota-red)] animate-pulse'
                          : 'bg-[var(--success)] animate-pulse'
                        : conversation.status === 'connecting'
                        ? 'bg-[var(--warning)] animate-pulse'
                        : 'bg-[var(--muted-foreground)]'
                    }`} />
                    {conversation.status === 'connected' 
                      ? conversation.isSpeaking 
                        ? 'Speaking...' 
                        : 'Listening'
                      : conversation.status === 'connecting' 
                      ? 'Connecting...' 
                      : 'Disconnected'}
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

                {/* Voice Status Indicator */}
                {conversation.status === 'connected' && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
                    conversation.isSpeaking
                      ? 'bg-[var(--toyota-red)]/10 border-[var(--toyota-red)]/30'
                      : 'bg-[var(--card)] border-[var(--border)]'
                  }`}>
                    {conversation.isSpeaking ? (
                      <>
                        <svg className="w-5 h-5 text-[var(--toyota-red)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M13.828 8.172a1 1 0 011.414 0A5.983 5.983 0 0116 12a5.983 5.983 0 01-.758 3.828 1 1 0 01-1.414-1.414A3.987 3.987 0 0014 12a3.987 3.987 0 00-.172-1.414 1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-[var(--toyota-red)]">Agent is speaking...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-[var(--success)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-[var(--muted-foreground)]">Listening for your voice...</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Test Button for Car Display (for development) */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    // Test with real 2024 Prius data (has full visual data from database)
                    const testCarData = {
                      id: '47243',
                      vehicleId: '47243',
                      make: 'Toyota',
                      model: 'Prius',
                      year: '2024',
                      msrp: 28350,
                      fuelType: 'Regular',
                      transmission: 'Automatic (variable gear ratios)',
                      colorCodes: '5C5, 1L0, 1M2, 218, 3U5, 089, 8Q4',
                      colorHexCodes: 'AB8214, 858585, 4c5156, 00031E, E20500, E3E9E9, 1A1C37',
                      colorNames: 'Karashi, Cutting Edge, Guardian Gray, Midnight Black Metallic, Supersonic Red, Wind Chill Pearl, Reservoir Blue',
                      modelTag: '1266, 1268, 1268, 1268, 1268, 1268, 1268',
                      modelGrade: 'nightshadeeditionawd, limitedawd, limitedawd, limitedawd, limitedawd, limitedawd, limitedawd',
                      imageCount: 36,
                      url: 'https://www.toyota.com/prius/',
                      cylinders: 4,
                      engineDisplacement: null,
                      drive: 'Front-Wheel Drive',
                      vehicleSizeClass: 'Midsize Cars',
                      cityMpgForFuelType1: 57,
                      combinedMpgForFuelType1: 56,
                      highwayMpgForFuelType1: 56,
                      has3D: true,
                      totalScore: 92,
                      confidenceScore: 95,
                      factors: {
                        vehicleTypeMatch: 90,
                        priceCompatibility: 85,
                        featureAlignment: 95,
                        passengerFit: 88,
                        fuelTypeMatch: 100,
                        usageCompatibility: 92,
                        locationFactor: 90
                      },
                      metadata: {
                        matchingFeatures: ['Fuel Efficiency', 'Hybrid Technology', 'Advanced Safety', 'Technology Package', 'Lane Keep Assist', 'Adaptive Cruise Control'],
                        missingFeatures: [],
                        featureNotes: ['Outstanding 56 MPG combined', 'Low emissions', 'Smart safety features'],
                        priceAnalysis: {
                          isWithinBudget: true,
                          percentageFromBudget: 0
                        },
                        passengerAnalysis: {
                          actualCapacity: 5,
                          configuration: 'Standard',
                          notes: 'Comfortable seating with eco-friendly materials'
                        },
                        usageAnalysis: ['Daily commuting', 'City driving', 'Long distance trips']
                      }
                    };
                    
                    displayCarInfo({ carData: JSON.stringify(testCarData) });
                  }}
                  className="px-4 py-2 bg-[var(--toyota-red)]/20 hover:bg-[var(--toyota-red)]/30 text-[var(--toyota-red)] text-sm rounded-lg border border-[var(--toyota-red)]/30 transition-all duration-200"
                >
                  Test Car Display (2024 Prius)
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Car Sidebar */}
      <CarSidebar 
        car={carData} 
        isOpen={isCarSidebarOpen} 
        onClose={() => setIsCarSidebarOpen(false)} 
      />

    </div>
  );
}

export default Avatar;
