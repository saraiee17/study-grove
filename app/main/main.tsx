import { useRef, useState, useEffect } from "react";
import studyGroveLogo from "../assets/studygrovelogo.png";
import clock from "../assets/clock2.svg";
import main from "../assets/main.mp4";
import cozybookstore from "../assets/cozybookstore.png";
import sunsetcliff from "../assets/sunsetcliff.png";
import sunsetstreet from "../assets/sunsetstreet.png";
import sunsetcliffVideo from "../assets/sunsetcliff.mp4";
import sunsetstreetVideo from "../assets/sunsetstreet.mp4";
import { PageTransition } from "../components/PageTransition";
import { Timer } from "../components/Timer";
import { ProblemBank } from "../components/ProblemBank";
import { TodoList } from "../components/TodoList";

// Screen options with their video sources
const screenOptions = [
  {
    id: 'cozy-bookstore',
    name: 'Cozy Bookstore',
    video: main,
    thumbnail: cozybookstore
  },
  {
    id: 'sunset-cliff',
    name: 'Sunset Cliff',
    video: sunsetcliffVideo,
    thumbnail: sunsetcliff
  },
  {
    id: 'sunset-street',
    name: 'Sunset Street',
    video: sunsetstreetVideo,
    thumbnail: sunsetstreet
  }
];

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export function Main() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [timerOpen, setTimerOpen] = useState(false);
  const [problemBankOpen, setProblemBankOpen] = useState(false);
  const [todoListOpen, setTodoListOpen] = useState(false);
  const [audioRef] = useState(useRef<HTMLAudioElement | null>(null));
  const [audioPlaying, setAudioPlaying] = useState(true);
  const [showAutoplayHint, setShowAutoplayHint] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [showScreenSwitcher, setShowScreenSwitcher] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [previewScreen, setPreviewScreen] = useState<number | null>(null);
  const [previewVideoRef] = useState(useRef<HTMLVideoElement | null>(null));
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [playTrigger, setPlayTrigger] = useState(0);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const youtubePlayerRef = useRef<any>(null);
  const [ytPlayer, setYtPlayer] = useState<any>(null);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    } else if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      setIsVideoLoading(true);
      video.muted = isMuted;
      
      const handleCanPlay = () => {
        setIsVideoLoading(false);
        // If triggered by a screen change, play the video
        if (playTrigger > 0) {
          video.play().catch(err => {
            console.warn("Video play failed on trigger:", err);
          });
        }
      };
      
      const handleError = (e: Event) => {
        console.error('Video failed to load:', screenOptions[currentScreen].name, e);
        setIsVideoLoading(false);
      };
      
      const handleLoadedData = () => {
        console.log('Video data loaded:', screenOptions[currentScreen].name);
      };
      
      const handlePlay = () => {
        console.log('Video started playing:', screenOptions[currentScreen].name);
      };
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('play', handlePlay);
      
      video.load();
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('play', handlePlay);
      };
    }
  }, [isMuted, currentScreen, playTrigger]);

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
    if (!ytPlayer) return;
    if (audioPlaying) {
      ytPlayer.pauseVideo();
      setAudioPlaying(false);
    } else {
      ytPlayer.playVideo();
      setAudioPlaying(true);
    }
  };

  const handleScreenChange = (screenIndex: number) => {
    setCurrentScreen(screenIndex);
    setShowScreenSwitcher(false);
    setPlayTrigger(Date.now());
    setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        video.load();
        video.play().then(() => {
          setShowPlayOverlay(false);
        }).catch((err) => {
          setShowPlayOverlay(true);
          console.warn('Immediate video play failed:', err);
        });
      }
    }, 10);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (showScreenSwitcher) {
      setShowScreenSwitcher(false);
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

  // Initialize YouTube Player
  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      if (youtubePlayerRef.current) return; // Prevent double init
      const player = new window.YT.Player('yt-bg-audio', {
        videoId: '9P3r0PiK7Yg',
        events: {
          onReady: (event: any) => {
            event.target.setVolume(50);
            event.target.playVideo();
            setYtPlayer(event.target);
          },
        },
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: '9P3r0PiK7Yg',
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          rel: 0,
        },
      });
      youtubePlayerRef.current = player;
    };
  }, []);

  // Ensure Cozy Bookstore video and audio play on initial load
  useEffect(() => {
    // Play video
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.load();
      setTimeout(() => {
        video.play().catch((err) => {
          console.warn('Initial video autoplay blocked or failed:', err);
        });
      }, 100);
    }
    // Play audio (YouTube)
    if (ytPlayer) {
      ytPlayer.playVideo();
      setAudioPlaying(true);
    }
  }, [ytPlayer]);

  // Add robust play logic and logging for video switching
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      let playTimeout: NodeJS.Timeout | null = null;
      let fallbackTimeout: NodeJS.Timeout | null = null;

      const onPlaying = () => {
        console.log('Video is visually playing:', screenOptions[currentScreen].name);
        setIsVideoLoading(false);
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
      };
      const onCanPlay = () => {
        setIsVideoLoading(false);
      };

      video.addEventListener('playing', onPlaying);
      video.addEventListener('canplay', onCanPlay);

      playTimeout = setTimeout(() => {
        video.play().then(() => {
          video.currentTime = 0;
          console.log('Video play() resolved and seeked to 0:', screenOptions[currentScreen].name);
        }).catch((err) => {
          console.warn('Video play failed after screen switch:', err);
        });
      }, 100);

      fallbackTimeout = setTimeout(() => {
        if (video.paused || video.currentTime === 0) {
          console.warn('Video did not start, retrying play():', screenOptions[currentScreen].name);
          video.play().catch(() => {});
        }
      }, 1200);

      return () => {
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('canplay', onCanPlay);
        if (playTimeout) clearTimeout(playTimeout);
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
      };
    }
  }, [currentScreen]);

  console.log('Rendering video:', screenOptions[currentScreen].video, 'isVideoLoading:', isVideoLoading);

  return (
    <PageTransition>
      <main className="relative min-h-screen overflow-hidden" onClick={showAutoplayHint ? handleUserInteraction : showScreenSwitcher ? handleClickOutside : undefined}>
        {/* Background Video (native video tag) */}
        <video
          key={screenOptions[currentScreen].id}
          ref={videoRef}
          src={screenOptions[currentScreen].video}
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ 
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* Fallback background when video is loading */}
        {isVideoLoading && (
          <div 
            className="absolute top-0 left-0 w-full h-full z-[-3]"
            style={{ 
              backgroundImage: `url(${screenOptions[currentScreen].thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}

        {/* Preview Video Overlay */}
        {previewScreen !== null && (
          <div 
            className="absolute top-0 left-0 w-full h-full z-[-1] transition-opacity duration-300"
            style={{ 
              backgroundImage: `url(${screenOptions[previewScreen].thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}

        {/* YouTube Background Audio (hidden) */}
        <div style={{ display: 'none' }}>
          <div id="yt-bg-audio"></div>
        </div>

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

        {/* Screen Switcher Button */}
        <div className="absolute bottom-4 left-4 z-10">
          <button
            onClick={() => setShowScreenSwitcher(!showScreenSwitcher)}
            className="w-12 h-12 p-2 rounded-full bg-[#F8EBD9] hover:opacity-80 transition-all duration-300 hover:scale-110 shadow-sm flex items-center justify-center"
            title="Change Background"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="#db8b44"
              />
            </svg>
          </button>
        </div>

        {/* Screen Selection Overlay */}
        {showScreenSwitcher && (
          <div className="absolute bottom-20 left-4 z-20">
            <div className="rounded-lg shadow-lg p-4 backdrop-blur-sm bg-white/10 border border-white/20">
              <div className="flex gap-6">
                {screenOptions.map((screen, index) => (
                  <div
                    key={screen.id}
                    className={`relative cursor-pointer transition-all duration-300 hover:scale-125 ${
                      currentScreen === index ? 'ring-2 ring-[#db8b44] ring-opacity-80' : ''
                    }`}
                    onClick={() => handleScreenChange(index)}
                    onMouseEnter={() => setPreviewScreen(index)}
                    onMouseLeave={() => setPreviewScreen(null)}
                  >
                    <div className="w-20 h-12 bg-gray-300 rounded overflow-hidden shadow-lg">
                      <img 
                        src={screen.thumbnail} 
                        alt={screen.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs text-white mt-1 text-center font-medium drop-shadow-lg">
                      {screen.name}
                    </div>
                    {currentScreen === index && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#db8b44] rounded-full flex items-center justify-center shadow-lg">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Play Background Overlay Fallback */}
        {showPlayOverlay && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <button
              className="px-6 py-3 rounded-lg bg-[#db8b44] text-white text-lg font-bold shadow-lg pointer-events-auto hover:bg-[#4A2C2A] transition-colors"
              onClick={() => {
                const video = videoRef.current;
                if (video) {
                  video.play().then(() => setShowPlayOverlay(false));
                }
              }}
            >
              ▶ Play Background
            </button>
          </div>
        )}

        {/* Main Page Content */}
        <div className="flex flex-col items-center gap-4 pt-24">
          {/* Add your content here */}
        </div>

      </main>
    </PageTransition>
  );
}
