export interface LabProject {
  title: string;
  alt?: string;
  thumbSrc: string;
  href: string;
}

const labProjects: LabProject[] = [
  {
    title: "Project Alpha",
    alt: "Screenshot of Project Alpha",
    thumbSrc: "/images/lab/placeholder.svg",
    href: "#alpha"
  },
  {
    title: "Project Beta",
    alt: "Screenshot of Project Beta",
    thumbSrc: "/images/lab/placeholder.svg",
    href: "#beta"
  },
  {
    title: "Project Gamma",
    alt: "Screenshot of Project Gamma",
    thumbSrc: "/images/lab/placeholder.svg",
    href: "#gamma"
  },
  {
    title: "Project Delta",
    alt: "Screenshot of Project Delta",
    thumbSrc: "/images/lab/placeholder.svg",
    href: "#delta"
  },
  {
    title: "Project Epsilon",
    alt: "Screenshot of Project Epsilon",
    thumbSrc: "/images/lab/placeholder.svg",
    href: "#epsilon"
  },
  {
    title: "Project Zeta",
    alt: "Screenshot of Project Zeta",
    thumbSrc: "/images/lab/placeholder.svg",
    href: "#zeta"
  }
];

export default labProjects;