import { useNavigate } from "react-router";
import studyGroveLogo from "../assets/studygrovelogo.png";
import { PageTransition } from "../components/PageTransition";

export function Welcome() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/main");
  };

  return (
    <PageTransition>
      <main 
        className="flex flex-col items-center justify-center min-h-screen cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex flex-col items-center flex-grow justify-center gap-4" style={{ minHeight: '60vh' }}>
          <div className="flex items-end gap-1 mt-24">
            <h1 className="text-5xl font-medium text-[#4A2C2A] dark:text-[#4A2C2A] tracking-[0.2em] transition-transform duration-500 hover:scale-105" style={{ fontFamily: 'Chewy, system-ui, sans-serif' }}>
              StudyGrove
            </h1>
            <img 
              src={studyGroveLogo} 
              alt="StudyGrove Logo" 
              className="w-16 h-16 -mb-2 transition-transform duration-500 hover:rotate-12"
            />
          </div>
          {/* Accessibility warning just a little lower */}
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded px-3 py-2 mt-6 shadow-sm" style={{maxWidth: 340}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="#db8b44"/><text x="10" y="15" textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">!</text></svg>
            <span className="text-xs text-[#b45309] font-medium">This app uses animated video backgrounds. If you are sensitive to motion or flashing, please proceed with caution. You can pause the background video in the app.</span>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
