import { useRef, useState, useEffect } from "react";
import studyGroveLogo from "../assets/studygrovelogo.png";
import mainVideo from "../assets/main.mp4";
import clock from "../assets/clock2.svg";
import { PageTransition } from "../components/PageTransition";
import { Timer } from "../components/Timer";

export function Main() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [timerOpen, setTimerOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
      video.play().catch((err) => {
        console.warn("Autoplay may be blocked:", err);
      });
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const PlayIcon = () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        points="20,16 48,32 20,48"
        fill="#db8b44"
        stroke="#58290b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
  
  const PauseIcon = () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="18"
        y="16"
        width="8"
        height="32"
        fill="#db8b44"
        stroke="#58290b"
        strokeWidth="2"
        rx="1"
      />
      <rect
        x="38"
        y="16"
        width="8"
        height="32"
        fill="#db8b44"
        stroke="#58290b"
        strokeWidth="2"
        rx="1"
      />
    </svg>
  );

  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
          src={mainVideo}
          loop
          controls={false}
          muted
          playsInline
          autoPlay
        />

        {/* Top-Left Buttons Container */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {/* Logo Button */}
          <button 
            className="w-12 h-12 p-2 rounded-full bg-[#F8EBD9] hover:opacity-80 transition-all duration-300 hover:scale-110 shadow-sm flex items-center justify-center"
            onClick={() => {}}
          >
            <img 
              src={studyGroveLogo} 
              alt="StudyGrove Logo" 
              className="w-8 h-8"
            />
          </button>

          {/* Mute Toggle Button */}
          <button
            onClick={toggleMute}
            className="w-12 h-12 p-2 rounded-full bg-[#F8EBD9] hover:opacity-80 transition-all duration-300 hover:scale-110 shadow-sm flex items-center justify-center"
          >
            {isMuted ? <PlayIcon /> : <PauseIcon />}
          </button>

          {/* Timer Button */}
          <button 
            className="w-12 h-12 p-2 rounded-full bg-[#F8EBD9] hover:opacity-80 transition-all duration-300 hover:scale-110 shadow-sm flex items-center justify-center"
            onClick={() => setTimerOpen(!timerOpen)}
          >
            <img src={clock} alt="clock" className="w-8 h-8" />
          </button>
        </div>

        {/* Timer Widget */}
        <Timer isOpen={timerOpen} onClose={() => setTimerOpen(false)} clockIcon={clock} />

        {/* Main Page Content */}
        <div className="flex flex-col items-center gap-4 pt-24">
          {/* Add your content here */}
        </div>
      </main>
    </PageTransition>
  );
}
