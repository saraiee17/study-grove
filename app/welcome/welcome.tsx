import { useNavigate } from "react-router";
import { useState } from "react";
import studyGroveLogo from "../assets/studygrovelogo.png";
import { PageTransition } from "../components/PageTransition";

export function Welcome() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const handleClick = () => {
    console.log("Click detected, navigating to main...");
    // Try immediate navigation first
    navigate("/main");
  };

  const handleClickWithTransition = () => {
    console.log("Click detected, starting transition...");
    setIsExiting(true);
    setTimeout(() => {
      console.log("Executing navigation...");
      navigate("/main");
    }, 500);
  };

  return (
    <PageTransition>
      <main 
        className={`flex items-center justify-center min-h-screen cursor-pointer transition-all duration-500
          ${isExiting ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-end gap-2">
            <h1 className="font-['Chomp'] text-5xl font-black text-[#4A2C2A] dark:text-[#4A2C2A] tracking-[0.2em] transition-transform duration-500 hover:scale-105">
              StudyGrove
            </h1>
            <img 
              src={studyGroveLogo} 
              alt="StudyGrove Logo" 
              className="w-16 h-16 -mb-2 transition-transform duration-500 hover:rotate-12"
            />
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
