import { Links, Meta, Outlet, Scripts } from "react-router";
import "./app.css";
import studyGroveLogo from "./assets/studygrovelogo.png";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Study Grove</title>
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Chewy&family=Comfortaa:wght@300..700&display=swap" rel="stylesheet" />
        
        {/* Favicon setup */}
        <link rel="icon" type="image/png" sizes="32x32" href={studyGroveLogo} />
        <link rel="icon" type="image/png" sizes="16x16" href={studyGroveLogo} />
        <link rel="apple-touch-icon" sizes="180x180" href={studyGroveLogo} />
        <meta name="theme-color" content="#ffffff" />
        
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
