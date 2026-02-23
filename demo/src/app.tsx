import { useEffect } from "react";
import { UploadWidget } from "./components/upload-widget";

export function App() { 
  useEffect(() => {
    // Clean up local storage items older than 5 minutes
    const EXPIRATION_TIME_MS = 5 * 60 * 1000;
    
    const cleanup = () => {
      const dataString = localStorage.getItem('uploads_demo_data');
      if (dataString) {
        try {
          const data = JSON.parse(dataString);
          const now = Date.now();
          const validData = data.filter((item: any) => {
            const itemTime = new Date(item.createdAt).getTime();
            return (now - itemTime) < EXPIRATION_TIME_MS;
          });
          
          if (validData.length !== data.length) {
            localStorage.setItem('uploads_demo_data', JSON.stringify(validData));
          }
        } catch (e) {
          localStorage.removeItem('uploads_demo_data');
        }
      }
    };

    // Run once on mount
    cleanup();
    
    // Run every minute
    const interval = setInterval(cleanup, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="h-dvh flex flex-col items-center justify-center p-10">
      <UploadWidget />
    </main>
  )
}

