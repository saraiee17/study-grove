import { useRef, useState, useEffect } from "react";
import studyGroveLogo from "../assets/studygrovelogo.png";
import clock from "../assets/clock2.svg";
import main from "../assets/main.mp4";
import { PageTransition } from "../components/PageTransition";
import { Timer } from "../components/Timer";
import { ProblemBank } from "../components/ProblemBank";
import { TodoList } from "../components/TodoList";

export function Main() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [timerOpen, setTimerOpen] = useState(false);
  const [problemBankOpen, setProblemBankOpen] = useState(false);
  const [todoListOpen, setTodoListOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(true);
  const [showAutoplayHint, setShowAutoplayHint] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = isMuted;
      video.play().catch((err) => {
        console.warn("Autoplay may be blocked:", err);
      });
    }
  }, [isMuted]);

  // Try to play audio on mount, show hint if blocked
  useEffect(() => {
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setShowAutoplayHint(true));
      }
    }
  }, []);

  // Handler for user interaction to start audio/video
  const handleUserInteraction = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setAudioPlaying(true);
    }
    setShowAutoplayHint(false);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play();
      setAudioPlaying(true);
    }
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
      <main className="relative min-h-screen overflow-hidden" onClick={showAutoplayHint ? handleUserInteraction : undefined}>
        {/* Background Video (native video tag) */}
        <video
          src={main}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
          style={{ pointerEvents: 'none' }}
        />

        {/* Background Audio (hidden) */}
        <audio
          ref={audioRef}
          src="https://rr4---sn-vgqsrn6l.googlevideo.com/videoplayback?expire=1750287200&ei=AO9SaPeOJ5eKvdIPz7PQ8AI&ip=86.38.220.233&id=o-ABLbs2wjGAO3Nyh2aDhSHYvjHhSsME7yW1tVjVMqCVlM&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&rms=au%2Cau&siu=1&bui=AY1jyLNOQKQrpngfM3lzY-iX7TZ4W1vVGwoGE-1Goqm4HGjOPeeiRvIw6sforVYMn2387qD4-w&spc=l3OVKWBMIVC7&vprv=1&svpuc=1&xtags=drc%3D1&mime=audio%2Fmp4&ns=1_VBk5ysQJoe178VFsCSiiEQ&rqh=1&gir=yes&clen=178904997&dur=11054.462&lmt=1739215459939479&keepalive=yes&fexp=24350590,24350737,24350827,24350961,24351173,24351316,24351318,24351528,24351759,24351907,24352011,24352022,24352102,24352188,24352236,24352322,51466643,51466698&c=TVHTML5_SIMPLY_EMBEDDED_PLAYER&sefc=1&txp=6308224&n=jNveaHNPvVbLCw&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Csiu%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cxtags%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhAKLn_vCR2N3jDCk5jtKVTk8Fxqc8zK5aStSVzmx9j6nBAiA82a-p9RPKPLg99M3bJl42r260bnH_EFZCH66PFjz9dw%3D%3D&title=enchanted+bookstore+%7C+magical+lofi+music+for+study+%26+reading&redirect_counter=1&rm=sn-4g5e6y7z&rrc=104&req_id=a82ff2e5b6d4a3ee&cms_redirect=yes&ipbypass=yes&met=1750265629,&mh=sT&mip=2601:249:8b01:7030:826:23e4:e0a8:aae6&mm=31&mn=sn-vgqsrn6l&ms=au&mt=1750264666&mv=m&mvi=4&pl=37&lsparams=ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=APaTxxMwRQIgONho5U_nOGQlGMwUNRp1weVIv1DR5_wjC3yeTjlDY14CIQC5VpugLFJpB3kFEPZttNDBnUagWh4NlE9BC8_9q-R7wg%3D%3D"
          autoPlay
          loop
          style={{ display: 'none' }}
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

          {/* Audio Play/Pause Circle Button */}
          <button
            onClick={toggleAudio}
            className="w-12 h-12 p-2 rounded-full bg-[#F8EBD9] hover:opacity-80 transition-all duration-300 hover:scale-110 shadow-sm flex items-center justify-center"
            title={audioPlaying ? "Pause Audio" : "Play Audio"}
          >
            {audioPlaying ? (
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
            ) : (
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
            )}
          </button>

          {/* Timer Button */}
          <button 
            className="w-12 h-12 p-2 rounded-full bg-[#F8EBD9] hover:opacity-80 transition-all duration-300 hover:scale-110 shadow-sm flex items-center justify-center"
            onClick={() => setTimerOpen(!timerOpen)}
          >
            <img src={clock} alt="clock" className="w-8 h-8" />
          </button>

          {/* Problem Bank Button */}
          <button 
            className="w-12 h-12 p-2 rounded-full bg-[#F8EBD9] hover:opacity-80 transition-all duration-300 hover:scale-110 shadow-sm flex items-center justify-center"
            onClick={() => setProblemBankOpen(!problemBankOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                fill="#db8b44"
              />
            </svg>
          </button>

          {/* Todo List Button */}
          <button 
            className="w-12 h-12 p-2 rounded-full bg-[#F8EBD9] hover:opacity-80 transition-all duration-300 hover:scale-110 shadow-sm flex items-center justify-center"
            onClick={() => setTodoListOpen(!todoListOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                fill="#db8b44"
              />
            </svg>
          </button>
        </div>

        {/* Timer Widget */}
        <Timer isOpen={timerOpen} onClose={() => setTimerOpen(false)} clockIcon={clock} />

        {/* Problem Bank Widget */}
        <ProblemBank isOpen={problemBankOpen} onClose={() => setProblemBankOpen(false)} />

        {/* Todo List Widget */}
        <TodoList isOpen={todoListOpen} onClose={() => setTodoListOpen(false)} />

        {/* Main Page Content */}
        <div className="flex flex-col items-center gap-4 pt-24">
          {/* Add your content here */}
        </div>

      </main>
    </PageTransition>
  );
}
