const BACKEND_URL = "http://localhost:5000/api/client-upload";

function getLeetCodeSlugFromUrl(url) {
    const match = url.match(/leetcode\.com\/problems\/([^\/]+)/);
    return match ? match[1] : null;
}

export async function sendRequestToBackend(audioBlob,textData){
    try{
        const url = window.location.href;
        const slug = getLeetCodeSlugFromUrl(url);
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
        if(slug){
            formData.append('slug',slug);
        }
        else{
            console.log("Problem Slug Not given");
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
        // console.log(data);
        return { success: true, data };
    }catch(err){
        return { success: false, error: err.message || "Unknown error" };
    }
}