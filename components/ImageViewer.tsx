
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageViewerProps {
  images: string[];
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when images prop changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]); // Add dependency to ensure closure captures current state logic if needed, though mostly static here

  if (!images || images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 rounded-full backdrop-blur-md transition-colors z-50"
      >
        <X size={24} />
      </button>
      
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-50 focus:outline-none"
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-50 focus:outline-none"
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}
      
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        <img 
          src={images[currentIndex]} 
          alt={`View ${currentIndex + 1}`} 
          className="max-h-[85vh] max-w-[95vw] object-contain rounded-sm shadow-2xl transition-opacity duration-300"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
        />
        {images.length > 1 && (
          <div className="absolute bottom-8 px-4 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white/90 text-sm font-medium tracking-wider">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;
