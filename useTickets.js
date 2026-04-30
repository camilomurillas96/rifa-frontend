import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      // No queremos que el loading se muestre en cada sondeo, solo la primera vez.
      // setLoading(true); 
      const response = await axios.get(`${API_URL}/api/tickets`);
      const sorted = response.data.sort((a, b) => a.number.localeCompare(b.number));
      setTickets(sorted);
      setError(null); // Limpiar errores previos si la conexión es exitosa
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor. Reintentando...");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  return { tickets, loading, error, fetchTickets };
}