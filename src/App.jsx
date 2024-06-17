import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    
    socket.on('previousMessages', (msgs) => {
      setMessages(msgs);
    });

    socket.on('chatMessage', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('previousMessages');
      socket.off('chatMessage');
    };
  }, []);

  // useEffect(() => {
    
  //   fetch("http://localhost:3000")
  //   .then(res => res.json())
  //   .then(res => console.log(res))
  //   .catch(error => console.log(error))
  // }, []);

  const sendMessage = () => {
    if (username && message) {
      const msg = { username, text: message };
      socket.emit('chatMessage', msg);
      setMessage('');
    }
  };

  const uploadFile = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('http://localhost:3000/upload', formData);
        const msg = { username, text: `File uploaded: <a href="${response.data.link}" target="_blank">${file.name}</a>` };
        socket.emit('chatMessage', msg);
        setFile(null);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <div className="App">
      <h1>Online Chat</h1>
      <div id="chat" style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}: </strong>
            <span dangerouslySetInnerHTML={{ __html: msg.text }}></span>
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: 'block', margin: '10px 0' }}
      />
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ display: 'block', margin: '10px 0', width: 'calc(100% - 110px)' }}
      />
      <button onClick={sendMessage} style={{ display: 'block', margin: '10px 0' }}>Send</button>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        style={{ display: 'block', margin: '10px 0' }}
      />
      <button onClick={uploadFile} style={{ display: 'block', margin: '10px 0' }}>Upload File</button>
    </div>
  );
}

export default App;
