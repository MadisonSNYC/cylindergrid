import type { LabProject } from "../../data/labProjects";

export default function LabTile({ project }: { project: LabProject }) {
  const { title, alt, thumbSrc, href } = project;
  return (
    <a className="lab-link block w-full h-full" href={href} aria-label={title} rel="noopener noreferrer">
      <img className="lab-img" src={thumbSrc} alt={alt ?? title} loading="lazy" />
    </a>
  );
}