import { SiX, SiGithub, SiDiscord, SiLinkedin, SiFarcaster } from "react-icons/si";
import { BsGlobe, BsCameraVideoFill, BsNewspaper, BsSignpostFill } from "react-icons/bs";
import { LuPresentation } from "react-icons/lu";


export const Icon: Record<string, JSX.Element> = {
  twitter: <SiX className="w-5 h-5" />,
  github: <SiGithub className="w-5 h-5" />,
  discord: <SiDiscord className="w-5 h-5" />,
  linkedin: <SiLinkedin className="w-5 h-5" />,
  website: <BsGlobe className="w-5 h-5" />,
  demovideo: <BsCameraVideoFill className="w-5 h-5" />,
  pitchdeck: <LuPresentation className="w-5 h-5" />,
  farcaster: <SiFarcaster className="w-5 h-5" />,
  "milestone": <BsSignpostFill className="w-5 h-5" />,
  "update": <BsNewspaper className="w-5 h-5" />,
};