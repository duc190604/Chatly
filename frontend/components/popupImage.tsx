import { useState, useRef, useEffect } from "react";
import { X, Download } from "lucide-react";
import { downloadFile } from "@/lib/utils";

type Props = {
  urlMedia: string;
  isOpen: boolean;
  onClose: () => void;
};

export const PopupImage = ({ urlMedia, isOpen, onClose }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImgDimensions({
        width: imgRef.current.offsetWidth,
        height: imgRef.current.offsetHeight,
      });
    }
  };

  if (!isOpen) return null;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newScale = Math.min(Math.max(1, scale + delta), 4); // Không cho zoom nhỏ hơn 1
    
    if (newScale === scale) return;

    const container = containerRef.current!;
    const rect = container.getBoundingClientRect();
    
    // Tọa độ chuột trong container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Tọa độ trung tâm container
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tọa độ chuột tương đối với trung tâm
    const offsetX = mouseX - centerX;
    const offsetY = mouseY - centerY;
    
    // Nếu scale = 1, đặt lại vị trí về trung tâm
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    } else {
      // Tính toán vị trí mới để zoom tại vị trí chuột
      const scaleRatio = newScale / scale;
      const newX = position.x + offsetX * (1 - scaleRatio);
      const newY = position.y + offsetY * (1 - scaleRatio);
      
      setPosition({ x: newX, y: newY });
    }

    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    
    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleDoubleClick = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-[100]"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => downloadFile(urlMedia)}
          className="p-2 text-white bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all duration-200"
          title="Download"
        >
          <Download size={20} />
        </button>
        <button
          onClick={resetZoom}
          className="p-2 text-white bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all duration-200"
          title="Reset zoom"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          onClick={onClose}
          className="p-2 text-white bg-black bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all duration-200"
          title="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Zoom info */}
      <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-lg text-sm">
        {Math.round(scale * 100)}% {scale === 1 ? '(Fit)' : ''}
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="w-full h-full p-3 overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
      >
        <img
          ref={imgRef}
          src={urlMedia}
          alt="popup"
          draggable={false}
          onLoad={handleImageLoad}
          className="select-none transition-transform duration-100 ease-out max-w-full max-h-full object-contain"
          style={{
            transform: scale === 1 
              ? 'none' 
              : `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Instructions */}
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
        <div className="text-center">
          <div>Lăn chuột để zoom • Kéo để di chuyển • Double-click để reset</div>
        </div>
      </div> */}
    </div>
  );
};