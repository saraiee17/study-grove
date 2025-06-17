import studyGroveLogo from "../assets/studygrovelogo.png";
import { PageTransition } from "../components/PageTransition";

export function Main() {
  return (
    <PageTransition>
      <main className="min-h-screen">
        <button 
          className="absolute top-4 left-4 p-2 rounded-full bg-[#F8EBD9] hover:opacity-80 transition-all duration-300 hover:scale-110 shadow-sm"
          onClick={() => {/* Add navigation or action here */}}
        >
          <img 
            src={studyGroveLogo} 
            alt="StudyGrove Logo" 
            className="w-8 h-8"
          />
        </button>
        <div className="flex flex-col items-center gap-4 pt-24">
        </div>
      </main>
    </PageTransition>
  );
}