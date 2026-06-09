import { useState, useEffect } from 'react';
import api from '../api';

export const useRoomStatus = (pollingIntervalMs = 10000) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data || []);
    } catch (e) {
      console.error('Failed to fetch real-time room status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, pollingIntervalMs);
    
    return () => clearInterval(interval);
  }, [pollingIntervalMs]);

  return { rooms, loading, refetch: fetchRooms };
};
