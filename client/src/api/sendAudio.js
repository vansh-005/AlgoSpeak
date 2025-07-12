// src/api/sendAudio.js
// const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || 5000;
// const BACKEND_URL  = `http://localhost:${BACKEND_PORT}/api/upload`;
const BACKEND_URL = "http://localhost:5000/api/upload";


export async function sendAudioToBackend(audioBlob) {
  try{
        const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch(BACKEND_URL,{
        method: 'POST',
        body: formData,
    });
   const data = await response.json();
    return { success: true, data };
  } catch (err) {
    // Log for debugging
    console.error("sendAudioToBackend error:", err);
    return { success: false, error: err.message || "Unknown error" };
  } 
}
