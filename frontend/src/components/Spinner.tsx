import { useState, useEffect } from "react";

interface CarSpinnerProps {
  model: string;
  year?: string;
  imageIndexOverride?: number;
  card?: boolean;
  noPadding?: boolean;
  // Scraped images from cars.com
  scrapedImages?: Record<string, string>; // Dictionary of image URLs {"0": "url1", "1": "url2", ...}
  // Legacy props (no longer used but kept for compatibility)
  modelTag?: string;
  modelGrade?: string;
  colorCodes?: string;
  imageCountOverride?: number;
  colorIndex?: number;
  imageType?: string;
}

const CarSpinner: React.FC<CarSpinnerProps> = ({
  imageIndexOverride,
  card,
  noPadding,
  scrapedImages,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMouseInside, setIsMouseInside] = useState(false);
  const imageCount = scrapedImages ? Object.keys(scrapedImages).length : 0;

  useEffect(() => {
    if (imageIndexOverride !== undefined && imageIndexOverride >= 0 && imageIndexOverride < imageCount) {
      setCurrentImageIndex(imageIndexOverride);
    }
  }, [imageIndexOverride, imageCount]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMouseInside && imageIndexOverride === undefined && imageCount > 0) {
      const { offsetWidth, offsetLeft } = e.currentTarget;
      const relativeX = e.clientX - offsetLeft;
      const percentage = relativeX / offsetWidth;
      const newIndex = Math.floor(percentage * imageCount) % imageCount;
      setCurrentImageIndex(newIndex);
    }
  };

  // Get the image URL from scraped images
  const getImageUrl = () => {
    if (!scrapedImages || imageCount === 0) {
      return null;
    }
    
    // Get image by exact key first
    const imageUrl = scrapedImages[currentImageIndex.toString()];
    if (imageUrl) {
      return imageUrl;
    }
    
    // Fallback: use modulo to cycle through available images
    const availableKeys = Object.keys(scrapedImages).sort((a, b) => parseInt(a) - parseInt(b));
    if (availableKeys.length > 0) {
      const keyIndex = currentImageIndex % availableKeys.length;
      return scrapedImages[availableKeys[keyIndex]];
    }
    
    return null;
  };

  const imageUrl = getImageUrl();
  const hasValidImage = imageUrl !== null;

  return (
    <div
      onMouseEnter={() => setIsMouseInside(true)}
      onMouseLeave={() => setIsMouseInside(false)}
      onMouseMove={handleMouseMove}
      className={`flex ${card ? "h-full w-auto" : "h-full w-auto"} items-center justify-center overflow-hidden`}
    >
      {!hasValidImage ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-3 text-center p-6">
            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
              <svg className="h-10 w-10 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Images not available
              </p>
              <p className="text-xs text-muted-foreground/70">
                for this vehicle
              </p>
            </div>
          </div>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt="Car Photo"
          onLoad={() => console.log("✅ Image loaded successfully:", imageUrl)}
          onError={(e) => {
            console.error("❌ Image failed to load");
            console.error("Failed URL:", (e.target as HTMLImageElement).src);
          }}
          className={`w-full h-full object-contain ${!noPadding && card ? "py-12" : "py-5"}`}
        />
      )}
    </div>
  );
};

export default CarSpinner;
