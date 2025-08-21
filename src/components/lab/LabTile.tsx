import type { LabProject } from '../../data/labProjects';

interface LabTileProps {
  project: LabProject;
  onTileClick?: (e: React.MouseEvent) => void;
}

export default function LabTile({ project, onTileClick }: LabTileProps) {
  const { title, alt, thumbSrc } = project;
  
  const handleClick = (e: React.MouseEvent) => {
    if (onTileClick) {
      onTileClick(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onTileClick) {
        onTileClick(e as unknown as React.MouseEvent);
      }
    }
  };
  
  return (
    <div
      className="lab-link block w-full h-full cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${title}`}
    >
      <img 
        className="lab-img" 
        src={thumbSrc} 
        alt={alt ?? title} 
        loading="lazy"
        draggable={false}
      />
    </div>
  );
}