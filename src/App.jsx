import { useEffect, useState } from 'react';
import axios from 'axios';
import AvailabilityMeter from './components/AvailabilityMeter';

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNumbers, setSelectedNumbers] = useState([]); // AHORA ES UN ARRAY (CARRITO)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tickets`);
      const sorted = response.data.sort((a, b) => a.number.localeCompare(b.number));
      setTickets(sorted);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const getTicketColor = (status, number) => {
    // Si está en MI carrito, lo pinto como "Sol/Arena" (Amarillo/Naranja brillante)
    if (selectedNumbers.includes(number)) return 'bg-yellow-400 border-yellow-600 text-yellow-900 transform scale-110 shadow-xl z-20 ring-4 ring-yellow-200';

    switch (status) {
      // Disponible: Burbuja de agua (Cyan muy claro con borde azul)
      case 'AVAILABLE': return 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800 cursor-pointer hover:shadow-lg hover:-translate-y-1';
      // Pendiente: Coral suave
      case 'PENDING': return 'bg-orange-100 border-orange-300 text-orange-800 cursor-not-allowed opacity-70';
      // Pagado: Gris/Rojo apagado (como roca o boya)
      case 'PAID': return 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-50 grayscale';
      default: return 'bg-gray-200';
    }
  };

  const handleToggleTicket = (ticket) => {
    if (ticket.status !== 'AVAILABLE') return;

    if (selectedNumbers.includes(ticket.number)) {
      // Si ya está, lo quitamos
      setSelectedNumbers(prev => prev.filter(n => n !== ticket.number));
    } else {
      // Si no está, lo agregamos (Máximo 10 por ejemplo)
      if (selectedNumbers.length >= 10) return alert("Máximo 10 boletas por compra");
      setSelectedNumbers(prev => [...prev, ticket.number]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedNumbers.length === 0) return;

    const payload = {
      numbers: selectedNumbers, // ENVIAMOS LA LISTA
      name: formData.name,
      phone: formData.phone,
      email: formData.email
    };

    try {
      await axios.post(`${API_URL}/api/tickets/reserve`, payload);

      const adminPhone = "573104572887"; // TU NÚMERO
      const message = `Hola! Camilo Quiero comprar los números: *${selectedNumbers.join(', ')}* a nombre de *${formData.name}*. Hare la transferencia al siguiente Nequi: 310XXX`;
      const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;

      alert(`✅ ¡Reservados! Serás redirigido a WhatsApp.`);
      window.open(whatsappUrl, '_blank');

      setIsModalOpen(false);
      setSelectedNumbers([]); // Limpiar carrito
      setFormData({ name: '', phone: '', email: '' });
      fetchTickets();

    } catch (err) {
      console.error(err);
      alert("❌ Error: " + (err.response?.data || "Error al reservar."));
    }
  };

  return (
    <div className="min-h-screen p-4 pb-32 sm:p-8 flex flex-col items-center relative">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-2 drop-shadow-md tracking-tight">
          Gran Sorteo Playero 🌊
        </h1>
        <p className="text-cyan-100 text-lg sm:text-xl font-light">
          ¡Gana un viaje inolvidable! Selecciona tus tickets de la suerte. 🍹
        </p>
      </div>

      {error && <div className="bg-red-500/90 text-white px-6 py-3 rounded-xl mb-6 shadow-lg backdrop-blur-sm border border-red-400">{error}</div>}

      {loading ? (
        <div className="animate-pulse text-xl text-blue-600">Cargando...</div>
      ) : (
        <>
          {/* Contenedor tipo "Vidrio" */}
          <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-8 rounded-3xl shadow-2xl w-full max-w-5xl border border-white/50">
            <AvailabilityMeter
              totalTickets={tickets.length}
              reservedCount={tickets.filter(t => t.status !== 'AVAILABLE').length}
            />
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.number}
                  onClick={() => handleToggleTicket(ticket)}
                  className={`
                  aspect-square flex items-center justify-center rounded-lg border-2 font-bold text-sm sm:text-xl transition-all duration-200 select-none
                  ${getTicketColor(ticket.status, ticket.number)}
                  ${ticket.status !== 'AVAILABLE' ? 'opacity-60' : ''}
                `}
                >
                  {ticket.number}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* --- BOTÓN FLOTANTE DEL CARRITO --- */}
      {selectedNumbers.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-40">
          <button
            className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 ring-4 ring-orange-200/50"
            onClick={() => setIsModalOpen(true)}
          >
            🛒 Comprar ({selectedNumbers.length}) - Ir a la Playa 🏖️
          </button>
        </div>
      )}

      {/* --- MODAL DE COMPRA MULTIPLE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border-2 border-cyan-100">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">🏝️ Resumen de Reserva</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white font-bold text-2xl transition-colors">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
                Estás apartando los números: <br />
                <span className="font-bold text-lg text-blue-800">{selectedNumbers.join(', ')}</span>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Nombre</label>
                <input type="text" name="name" required className="w-full border p-3 rounded" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Celular</label>
                <input type="tel" name="phone" required className="w-full border p-3 rounded" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">Email</label>
                <input type="email" name="email" className="w-full border p-3 rounded" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md">
                Confirmar Reserva ✅
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;