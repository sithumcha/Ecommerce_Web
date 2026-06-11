// Fetch is native in Node.js v18+

async function testChat() {
  try {
    // 1. Log in as admin (to get token)
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ecommerce.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    console.log('Login Admin:', loginData);
    const token = loginData.token;
    const adminId = loginData._id;

    // 2. Log in as john (to get token)
    const loginRes2 = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@example.com', password: 'user123' })
    });
    const loginData2 = await loginRes2.json();
    console.log('Login John:', loginData2);
    const token2 = loginData2.token;
    const johnId = loginData2._id;

    // 3. Admin sends message to John
    const sendRes = await fetch('http://localhost:5001/api/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ receiverId: johnId, content: 'Hello John! This is a test.' })
    });
    const sendData = await sendRes.json();
    console.log('Send Message Response:', sendData);

    // 4. John gets conversations
    const convRes = await fetch('http://localhost:5001/api/messages/conversations', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token2}`
      }
    });
    const convData = await convRes.json();
    console.log('John Conversations:', JSON.stringify(convData, null, 2));

    // 5. John gets messages with Admin
    const msgRes = await fetch(`http://localhost:5001/api/messages/${adminId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token2}`
      }
    });
    const msgData = await msgRes.json();
    console.log('John Messages with Admin:', JSON.stringify(msgData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

testChat();
