import Spline from '@splinetool/react-spline';
import { useConversation } from '@elevenlabs/react';
import { useState, useRef, useEffect } from 'react';
import { getSignedUrl } from '../../lib/api/elevenlabs';
import { CarVRCard } from '../../components/CarVRCard';
import type { VehicleScore } from '../../lib/types';

function Avatar() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [carData, setCarData] = useState<VehicleScore | null>(null);
  const [isCarSidebarOpen, setIsCarSidebarOpen] = useState(false);
  const avatarToAnimate = useRef<any>(null);
  const ballsToAnimate = useRef<any>(null);
  const SPLINE_URL="https://prod.spline.design/uFrHM1KSZn46gTnk/scene.splinecode"

  function onLoad(spline: any) {
    const avatarObj = spline.findObjectByName('Avatar');
    const ballsObj = spline.findObjectByName('Balls');
    console.log(spline)
    // save the object in a ref for later use
    avatarToAnimate.current = avatarObj;
    ballsToAnimate.current = ballsObj;
    
    // Trigger idle animation on load (if you have an object named 'Avatar' with 'start' event)
  }

  // Create client tool for searching and displaying car information
  const displayCarInfo = async (parameters: any) => {
    console.log('search_car called with parameters:', parameters);
    
    try {
      // ElevenLabs may nest parameters, so check both structures
      const params = parameters.car_details || parameters;
      
      // Extract search parameters (all optional except make and model)
      const { make, model, year, fuelType, drive, minMpg, maxPrice } = params;
      
      if (!make || !model) {
        console.error('Missing make or model parameter');
        return "Error: Please provide both make and model.";
      }
      
      // Build request body with all parameters
      const requestBody: any = { make, model };
      if (year) requestBody.year = year;
      if (fuelType) requestBody.fuelType = fuelType;
      if (drive) requestBody.drive = drive;
      if (minMpg) requestBody.minMpg = parseInt(minMpg);
      if (maxPrice) requestBody.maxPrice = parseInt(maxPrice);
      
      // Call the backend API to search for the car
      const apiUrl = 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/agent-tools/search-car`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.carData) {
        return result.error || "Vehicle not found.";
      }
      
      // Parse the car data from the API response
      const carInfo = JSON.parse(result.carData);
      
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
          // New fields for scraped car data
          imageType: carInfo.imageType || "toyota360",
          images: carInfo.images || null,
          horsepower: carInfo.horsepower || null,
          seatingCapacity: carInfo.seatingCapacity || null,
          cargoSpace: carInfo.cargoSpace || null,
          towingCapacity: carInfo.towingCapacity || null,
          fuelTankCapacity: carInfo.fuelTankCapacity || null,
          curbWeight: carInfo.curbWeight || null,
          groundClearance: carInfo.groundClearance || null,
          dimensions: carInfo.dimensions || null,
          bodyStyle: carInfo.bodyStyle || null,
          drivetrain: carInfo.drivetrain || null,
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
      console.error('Error searching for car:', error);
      return `Failed to search for vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const conversation = useConversation({
    clientTools: { search_car: displayCarInfo },
    onConnect: () => {
      setIsConnecting(false);
      // Trigger listening animation when connected
      // triggerAnimation('mouseHover', 'Avatar'); // or use 'start' if you prefer
    },
    onDisconnect: () => {
      setIsConnecting(false);
      // Return to idle state
      // triggerAnimation('start', 'Avatar');
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      setIsConnecting(false);
      // Return to idle on error
      // triggerAnimation('start', 'Avatar');
    },
    onModeChange: (mode) => {
      console.log('Conversation mode changed:', mode);
      // Mode will be 'speaking' when agent is talking, 'listening' when waiting for user
      
      // Trigger animations based on conversation mode
      if (mode.mode === 'speaking') {
        // triggerAnimation('mouseDown', 'Avatar'); // Speaking animation
      } else if (mode.mode === 'listening') {
        // triggerAnimation('mouseHover', 'Avatar'); // Listening animation
      }
    },
  });

  // Effect to handle conversation status changes for more responsive animations
  useEffect(() => {
    if (conversation.status === 'connected') {
      if (conversation.isSpeaking) {
        avatarToAnimate.current.emitEvent('mouseDown');
      } else {
        avatarToAnimate.current.emitEvent('');
        ballsToAnimate.current.emitEvent('mouseUp');
      }
    } else if (conversation.status === 'connecting') {
      // triggerAnimation('keyDown', 'Avatar'); // Thinking/connecting
    } else {
      // triggerAnimation('start', 'Avatar'); // Idle
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
      <main className="flex-1 relative overflow-hidden">
        {/* Avatar Container */}
        <div className="relative h-full flex items-center justify-center p-4">
          <div className="w-full max-w-5xl mx-auto">
            <div className="relative w-full">
              {/* Main Avatar Container */}
              <div 
                className="relative bg-[var(--card)]/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl w-full h-[65vh] min-h-[500px] max-h-[700px]"
                style={{
                  boxShadow: '0 0 30px var(--glass-glow-strong)',
                }}
              >
                <div className="absolute inset-0">
                  <Spline scene={SPLINE_URL} onLoad={onLoad} />
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
                        ? 'Speaking' 
                        : 'Listening'
                      : conversation.status === 'connecting' 
                      ? 'Connecting' 
                      : 'Ready'}
                  </div>
                </div>
              </div>

              {/* Voice Control - Single Circular Button */}
              <div className="mt-6 flex justify-center gap-4 items-center">
                {conversation.status !== 'connected' ? (
                  <button
                    onClick={handleTalkToUs}
                    disabled={isConnecting || conversation.status === 'connecting'}
                    className="group relative w-16 h-16 bg-[var(--toyota-red)] hover:bg-[var(--toyota-red-dark)] disabled:bg-[var(--toyota-red)]/50 text-[var(--toyota-white)] rounded-full transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {isConnecting || conversation.status === 'connecting' ? (
                      <div className="w-6 h-6 border-2 border-[var(--toyota-white)]/30 border-t-[var(--toyota-white)] rounded-full animate-spin" />
                    ) : (
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleEndConversation}
                    className="group relative w-16 h-16 bg-[var(--destructive)] hover:bg-[var(--destructive)]/90 text-[var(--destructive-foreground)] rounded-full transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}

                {/* Test Button for Car Display (for development) */}
                {/* <button
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
                  Test Car Display
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* VR-Style Car Card */}
      <CarVRCard 
        car={carData} 
        isOpen={isCarSidebarOpen} 
        onClose={() => setIsCarSidebarOpen(false)} 
      />

    </div>
  );
}

export default Avatar;
