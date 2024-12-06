const fs = require('fs');

const API_TOKEN = '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';  // Replace with your Hugging Face API token
const API_URL = 'https://api-inference.huggingface.co/models/openai/whisper-large';

async function transcribeAudio(audioFilePath) {
  const audioFile = fs.createReadStream(audioFilePath);
  console.log({audioFile})

  const formData = new FormData();
  formData.append("file", audioFile);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    },
    body: formData
  });

  const data = await response.json();
  if (data.text) {
    console.log("Transcription:", data.text);
  } else {
    console.log("Error:", data);
  }
}

// Example usage
transcribeAudio('path_to_audio_file.wav');
