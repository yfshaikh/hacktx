import { useState, useEffect } from "react";

interface CarSpinnerProps {
  model: string;
  modelTag: string;
  modelGrade: string;
  colorCodes: string;
  imageIndexOverride?: number;
  imageCountOverride?: number;
  card?: boolean;
  noPadding?: boolean;
  colorIndex?: number;
}

const CarSpinner: React.FC<CarSpinnerProps> = ({
  model,
  modelTag,
  modelGrade,
  colorCodes,
  imageIndexOverride,
  imageCountOverride,
  card,
  noPadding,
  colorIndex,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(10);
  const [isMouseInside, setIsMouseInside] = useState(false);
  const [randomColor, setRandomColor] = useState("");
  const [randomModelGrade, setRandomModelGrade] = useState("");
  const [randomModelTag, setRandomModelTag] = useState("");
  const [imageCount, setImageCount] = useState(36);
  const [year, setYear] = useState("2025");
  const [modelName, setModelName] = useState("");

  useEffect(() => {
    setCurrentImageIndex(imageCount - 3);
  }, [imageCount]);

  useEffect(() => {
    if (
      imageCountOverride !== undefined &&
      imageCountOverride > 0 &&
      Number.isInteger(imageCountOverride)
    ) {
      setImageCount(imageCountOverride);
    } else {
      setImageCount(36);
    }
  }, [imageCountOverride]);

  useEffect(() => {
    if (
      imageIndexOverride !== undefined &&
      imageIndexOverride >= 0 &&
      imageIndexOverride < imageCount
    ) {
      setCurrentImageIndex(imageIndexOverride);
    } else if (imageIndexOverride !== undefined) {
      setCurrentImageIndex(17);
    }
  }, [imageIndexOverride, imageCount]);


  useEffect(() => {
    if (model.split(" ")[1]?.toLowerCase() === "highlander") {
      console.log("highlander: ", model);
      setModelName("grandhighlander");
    } else if (model.split(" ")[0]?.toLowerCase() === "gr") {
      setModelName(model.replace(" ", "").toLowerCase());
    } else if (model.split(" ")[0]?.toLowerCase() === "crown") {
      setModelName("toyotacrown");
    } else if (model.split(" ")[0]?.toLowerCase() === "land") {
      setModelName("landcruiser");
    }
    else {
      setModelName(model.split(" ")[0]?.toLowerCase() || "");
    }

    if (model.split(" ")[0]?.toLowerCase() === "venza") {
      setYear("2024");
    }
  }, [model]);

  useEffect(() => {
    const colorCodeArray = colorCodes
      .split(",")
      .map((color) => color.trim().toLowerCase());
    const modelGradeArray = modelGrade
      .split(",")
      .map((grade) => grade.trim());
    let modelTagArray: string[] = [];
    if (modelTag) {
      modelTagArray = modelTag.split(",").map((tag) => tag.trim());
    }
    if (colorIndex === undefined) {
      const randomIndex = Math.floor(Math.random() * colorCodeArray.length);
      setRandomColor(colorCodeArray[randomIndex] || "");
      setRandomModelGrade(modelGradeArray[randomIndex] || "");
      setRandomModelTag(modelTagArray[randomIndex] || "");
    } else {
      setRandomColor(colorCodeArray[colorIndex] || "");
      setRandomModelGrade(modelGradeArray[colorIndex] || "");
      setRandomModelTag(modelTagArray[colorIndex] || "");
      console.log("colorIndex: ", colorIndex);
    }
  }, [colorCodes, modelGrade, modelTag, colorIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("handleMouseMove");
    if (isMouseInside && imageIndexOverride === undefined) {

      const { offsetWidth, offsetLeft } = e.currentTarget;
      const relativeX = e.clientX - offsetLeft;
      const percentage = relativeX / offsetWidth + 0.4;
      const newIndex = Math.floor(percentage * imageCount) % imageCount;
      setCurrentImageIndex(newIndex);
    }
  };

  return (
    <div
      onMouseEnter={() => {
        setIsMouseInside(true);
        console.log("mouse enter");
      }}
      onMouseLeave={() => setIsMouseInside(false)}
      onMouseMove={handleMouseMove}
      className={`flex ${card ? "h-full w-auto" : "h-full w-auto"} items-center justify-center overflow-hidden`}
    >
      {randomColor === "" ||
      randomModelGrade === "" ||
      randomModelTag === "" ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-3 text-center p-6">
            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
              <svg className="h-10 w-10 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                360° images not available
              </p>
              <p className="text-xs text-muted-foreground/70">
                for this year/model
              </p>
            </div>
          </div>
        </div>
      ) : (
        <img
          src={`https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/${year}/${modelName}/${randomModelGrade}/${randomModelTag}/${randomColor}/${imageCount}/${currentImageIndex}.png?fmt=webp-alpha&wid=930&qlt=90`}
          alt="Spinning Car"
          className={`${card ? "h-full w-full -translate-x-7" : "w-full"} object-cover ${!noPadding && card ? "py-12" : "py-5"}`}
        />
      )}
    </div>
  );
};

export default CarSpinner;
