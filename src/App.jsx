import React from 'react';
import { Route, Routes } from 'react-router';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import './App.css';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />
      </Routes>
  );
}

export default App;