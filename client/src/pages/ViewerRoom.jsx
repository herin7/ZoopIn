import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ViewerRoom = () => {
  const [roomIdStr, setRoomIdStr] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomIdStr) {
      navigate(`/live/${roomIdStr}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-teal-600">Join Live Session</h1>
        <form onSubmit={handleJoin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Room ID</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={roomIdStr}
              onChange={(e) => setRoomIdStr(e.target.value)}
              placeholder="Enter Room ID"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default ViewerRoom;
