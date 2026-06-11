import axios from 'axios';

async function testEndpoint() {
  try {
    const res = await axios.post('http://localhost:5001/api/ai/chat', {
      message: 'Hello',
      history: [
        { role: 'assistant', content: 'Hello! I am your NexusCart virtual assistant. How can I help you today?' }
      ]
    });
    console.log('Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('API Error Response:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

testEndpoint();
