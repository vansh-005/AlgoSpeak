const BACKEND_URL = "http://localhost:5000/api/client-upload";

export async function sendRequestToBackend(audioBlob,textData){
    try{
        const { token } = await new Promise(res =>
            chrome.storage.local.get('token', res)
        );
        // console.log(token);
        // console.log(textData);
        const formData = new FormData();
        if(audioBlob){
            console.log("Sending Audio File")
            formData.append('audio', audioBlob, 'recording.webm');
        }
        if(textData){
            formData.append('text',textData);
        }
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

          if (!response.ok) {
        // You can inspect status here for 401 etc.
            const error = await response.text();
            return { success: false, error: error || `Status ${response.status}` };
        }
        const data = await response.json();
        return { success: true, data };
    }catch(err){
        return { success: false, error: err.message || "Unknown error" };
    }
}