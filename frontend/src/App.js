import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [summaryId, setSummaryId] = useState('');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [textLang, setTextLang] = useState('french');
  const [audioLang, setAudioLang] = useState('french');
  const [error, setError] = useState('');

  const handleGetDescription = async () => {
    try {
      const response = await axios.post('http://localhost:4000/patient-description', {
        summary_id: summaryId,
        language: textLang
      });
      setDescription(response.data.description);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch description');
      setDescription('');
    }
  };

  const handleChatResponse = async () => {
    try {
      const response = await axios.post('http://localhost:4000/chat-response', {
        summary_id: summaryId,
        question,
        language: textLang
      });

      const newEntry = {
        question,
        response: response.data.response
      };
      setChatHistory([...chatHistory, newEntry]);
      setQuestion('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch chat response');
    }
  };

  const handleAudio = async (text) => {
    try {
      await axios.post('http://localhost:4000/text-to-speech', {
        text,
        language: audioLang
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to play audio');
    }
  };

  return (
    <div className="main-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Info du Patient</h2>

        <label>Summary ID</label>
        <input
          type="text"
          value={summaryId}
          onChange={(e) => setSummaryId(e.target.value)}
          placeholder="Entrer votre patient ID"
        />

        <label>Langue Texte</label>
        <select value={textLang} onChange={(e) => setTextLang(e.target.value)}>
          <option value="french">French</option>
          <option value="english">English</option>
          <option value="german">Douala</option>
          <option value="spanish">Ewondo</option>
        </select>

        <label>Langue Audio</label>
        <select value={audioLang} onChange={(e) => setAudioLang(e.target.value)}>
          <option value="french">French</option>
          <option value="english">English</option>
          <option value="german">Douala</option>
          <option value="spanish">Ewondo</option>
        </select>

        <button onClick={handleGetDescription}>Resumé médical</button>

        {description && (
          <div className="response">
            <h3>Description</h3>
            <p>{description}</p>
            <button onClick={() => handleAudio(description)}>🔊 Ecouter</button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <h2>Health Tech</h2>


        <div className="chat-box">
          {chatHistory.map((msg, index) => (
            <div key={index} className="chat-entry">
              <p><strong>Vous:</strong> {msg.question}</p>
              <p><strong>Bot:</strong> {msg.response}</p>
              <button onClick={() => handleAudio(msg.response)}>🔊 Ecouter</button>
            </div>
          ))}
        </div>
        <div className="section">
          <label>Poser une question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Entrer votre question..."
          />
          <button onClick={handleChatResponse}>Envoyer</button>
        </div>

        {error && (
          <div className="response error">
            <h3>Erreur</h3>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
