import { useState, useMemo } from 'react';
import axios from 'axios';
import AvailabilityMeter from './components/AvailabilityMeter';
import { useTickets } from '../useTickets.js';

// --- Componentes Internos para Mejorar la Estructura ---

// Componente para destacar el premio. ¡Esto es clave para el marketing!
const PrizeDetails = () => (
  <div className="mb-8 w-full max-w-5xl bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-center shadow-lg">
    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 drop-shadow-lg">El Premio: ¡Un Paraíso para Dos!</h2>
    <p className="text-cyan-200 text-base sm:text-lg">
      Gana un viaje a <strong>San Andrés Islas</strong> 🏝️ para 2 personas. Incluye:
    </p>
    <ul className="mt-4 text-white list-none space-y-2 font-medium">
      <li>✈️ Tiquetes aéreos ida y vuelta</li>
      <li>🏨 Hospedaje 3 días y 2 noches en hotel frente al mar</li>
      <li>🍳 Desayunos incluidos</li>
    </ul>
  </div>
);

// --- Componente para Términos y Condiciones ---
const TermsAndConditions = ({ saleThreshold }) => (
  <div className="mt-12 w-full max-w-5xl bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-left shadow-lg">
    <h3 className="text-xl font-bold text-white mb-4 text-center">📜 Términos y Condiciones</h3>
    <ul className="list-disc list-inside space-y-3 text-gray-300 text-sm sm:text-base">
      <li>El premio consiste en un viaje para dos (2) personas a San Andrés Islas, Colombia, como se describe en la sección del premio.</li>
      <li>Se realizará con las dos últimas cifras del premio mayor de la Lotería del Valle en la fecha estipulada una vez se alcance el {saleThreshold}% de la venta.</li>
      <li>El ganador tendrá un plazo máximo de <strong>seis (6) meses</strong> a partir de la fecha para redimir el premio.</li>
      <li>La reserva del viaje debe coordinarse con el organizador con un mínimo de <strong>30 días de antelación</strong>.</li>
      <li>El viaje <strong>no es válido para temporada alta</strong> (Semana Santa, receso escolar, del 15 de diciembre al 15 de enero) ni fines de semana con puentes festivos.</li>
      <li>El premio no es canjeable por dinero en efectivo ni transferible a terceros.</li>
      <li>Las boletas reservadas y no pagadas en un plazo de <strong>24 horas</strong> serán liberadas y puestas a la venta nuevamente.</li>
    </ul>
  </div>
);

// Un "esqueleto" de carga para una mejor experiencia visual.
const TicketGridSkeleton = () => (
  <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-4">
    {Array.from({ length: 100 }).map((_, i) => (
      <div key={i} className="aspect-square bg-white/20 rounded-lg animate-pulse"></div>
    ))}
  </div>
);

function App() {
  // --- Constantes Comerciales (fácil de modificar aquí) ---
  const TICKET_PRICE = 40000;
  const SALE_THRESHOLD_PERCENT = 80;
  const currencyFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

  const { tickets, loading, error, fetchTickets } = useTickets();
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Nuevo estado para controlar el flujo de la reserva en el modal
  const [reservationStatus, setReservationStatus] = useState('idle'); // idle | submitting | success | error
  const [reservationError, setReservationError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
  const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || "573104572887";

  // Refactorización de estilos para mayor claridad
  const ticketColorClasses = {
    SELECTED: 'bg-yellow-400 border-yellow-600 text-yellow-900 transform scale-110 shadow-xl z-20 ring-4 ring-yellow-200',
    AVAILABLE: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-800 cursor-pointer hover:shadow-lg hover:-translate-y-1',
    PENDING: 'bg-orange-100 border-orange-300 text-orange-800 cursor-not-allowed opacity-70',
    PAID: 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-50 grayscale',
    DEFAULT: 'bg-gray-200'
  };
  
  const getTicketColor = (status, number) => {
    if (selectedNumbers.includes(number)) {
      return ticketColorClasses.SELECTED;
    }
    return ticketColorClasses[status] || ticketColorClasses.DEFAULT;
  };

  const handleToggleTicket = (ticket) => {
    if (ticket.status !== 'AVAILABLE') return;

    if (selectedNumbers.includes(ticket.number)) {
      setSelectedNumbers(prev => prev.filter(n => n !== ticket.number));
    } else {
      if (selectedNumbers.length >= 10) {
        alert("Puedes seleccionar un máximo de 10 boletas por compra.");
        return;
      }
      // Ordenamos los números seleccionados para que se vean bien en el modal
      setSelectedNumbers(prev => [...prev, ticket.number].sort((a, b) => a.localeCompare(b)));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Pequeño delay para que la animación de cierre del modal se vea bien
    setTimeout(() => {
      // Si la reserva fue exitosa, limpiamos todo y refrescamos los tiquetes
      if (reservationStatus === 'success') {
        setSelectedNumbers([]);
        setFormData({ name: '', phone: '', email: '' });
        fetchTickets();
      }
      // Reseteamos el estado del modal para la proxima vez que se abra
      setReservationStatus('idle');
      setReservationError('');
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedNumbers.length === 0) return;
 
    setReservationStatus('submitting');
    setReservationError('');

    const payload = {
      numbers: selectedNumbers,
      name: formData.name,
      phone: formData.phone,
      email: formData.email
    };
 
    try {
      await axios.post(`${API_URL}/api/tickets/reserve`, payload);
      setReservationStatus('success');
      // La lógica de limpieza y cierre del modal ahora está en `handleCloseModal`
      // para que el usuario pueda ver el mensaje de éxito antes de que todo desaparezca.
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.response?.data || "Ocurrió un error al reservar. Intenta de nuevo.";
      setReservationError(errorMessage);
      setReservationStatus('error');
    }
  };

  // Usamos useMemo para evitar recalcular en cada renderizado
  const reservedCount = useMemo(() => tickets.filter(t => t.status !== 'AVAILABLE').length, [tickets]);

  // Calculamos el costo total de la selección actual
  const totalCost = useMemo(() => selectedNumbers.length * TICKET_PRICE, [selectedNumbers]);

  // Calculamos el link de WhatsApp para usarlo en el modal de éxito
  const whatsappMessage = `¡Hola! Quiero reservar los tiquetes para el viaje a San Andrés. Mis números son: *${selectedNumbers.join(', ')}*. Mi nombre es *${formData.name}*. ¡Gracias!`;
  const whatsappUrl = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;

  // NOTA: Para el fondo, agrega una imagen de San Andrés a tu carpeta `public`
  // y luego en tu archivo `index.css` (o similar) agrega:
  // .bg-san-andres-bg { background-image: url('/nombre-de-tu-imagen.jpg'); }
  return (
    <div className="min-h-screen p-4 pb-32 sm:p-8 flex flex-col items-center relative bg-blue-900 bg-san-andres-bg bg-cover bg-center bg-no-repeat">
      {/* Capa semitransparente para mejorar la legibilidad del texto sobre la imagen */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      {/* Todo el contenido debe estar en un contenedor con z-index para que se vea sobre la capa */}
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="text-center mb-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-2 drop-shadow-lg tracking-tight">
            ¡Rumbo a San Andrés! 🏝️
          </h1>
          {/* Mensaje comercial con el precio bien visible */}
          <p className="text-cyan-100 text-lg sm:text-xl font-light drop-shadow-md max-w-2xl mx-auto">
            Invierte en tu sueño por solo <span className="font-bold text-yellow-300">{currencyFormatter.format(TICKET_PRICE)}</span> por boleta y gana un viaje inolvidable.
          </p>
          <p className="text-white text-lg sm:text-xl font-bold drop-shadow-md">
            ¡Elige tus números de la suerte!
          </p>
        </div>

        <PrizeDetails />

        {error && <div className="bg-red-500/90 text-white px-6 py-3 rounded-xl mb-6 shadow-lg backdrop-blur-sm border border-red-400">{error}</div>}

        {loading && tickets.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-8 rounded-3xl shadow-2xl w-full max-w-5xl border border-white/50">
            <AvailabilityMeter totalTickets={100} reservedCount={0} />
            <TicketGridSkeleton />
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-8 rounded-3xl shadow-2xl w-full max-w-5xl border border-white/50">
            <AvailabilityMeter
              totalTickets={tickets.length}
              reservedCount={reservedCount}
            />
            {/* Mensaje de la condición, ¡clave para la transparencia! */}
            <div className="mt-4 mb-6 text-center bg-yellow-100/80 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded-r-lg shadow">
              <p className="font-bold">🎯 ¡Aviso Importante!</p>
              <p className="text-sm">Se jugará con la Lotería del Valle una vez se haya vendido el <strong>{SALE_THRESHOLD_PERCENT}%</strong> del total de las boletas. ¡Tu compra nos acerca a la meta!</p>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.number}
                  onClick={() => handleToggleTicket(ticket)}
                  className={`
                  aspect-square flex items-center justify-center rounded-lg border-2 font-bold text-sm sm:text-xl transition-all duration-200 select-none
                  ${getTicketColor(ticket.status, ticket.number)}
                `}
                >
                  {ticket.number}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección de Términos y Condiciones */}
        <TermsAndConditions saleThreshold={SALE_THRESHOLD_PERCENT} />

        {selectedNumbers.length > 0 && (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-40">
            <button
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 ring-4 ring-orange-200/50 animate-fade-in-up"
              onClick={() => setIsModalOpen(true)}
            >
              🛒 Reservar ({selectedNumbers.length}) | <span className="font-semibold">{currencyFormatter.format(totalCost)}</span>
            </button>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleCloseModal}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border-2 border-cyan-100" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {reservationStatus === 'success' ? '✅ ¡Paso Final!' : '🏝️ Finalizar Reserva'}
                </h2>
                <button onClick={handleCloseModal} className="text-white/80 hover:text-white font-bold text-2xl transition-colors">&times;</button>
              </div>

              {/* --- Vista del Formulario (Estado Inicial) --- */}
              {reservationStatus === 'idle' && (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Estás a un paso de apartar los números:</p>
                    <p className="font-bold text-2xl text-blue-800 tracking-wider my-1">{selectedNumbers.join(', ')}</p>
                    <p className="text-sm text-gray-600">Total a pagar: <span className="font-bold text-lg">{currencyFormatter.format(totalCost)}</span> ({selectedNumbers.length} boletas)</p>
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-bold mb-1">Nombre Completo</label>
                    <input id="name" type="text" name="name" placeholder="Ej: Juan Pérez" required className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-bold mb-1">Celular (WhatsApp)</label>
                    <input id="phone" type="tel" name="phone" placeholder="Ej: 3101234567" required className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-bold mb-1">Email (Opcional)</label>
                    <input id="email" type="email" name="email" placeholder="Ej: juan.perez@email.com" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-lg">
                    Confirmar Reserva
                  </button>
                </form>
              )}

              {/* --- Vista de Carga --- */}
              {reservationStatus === 'submitting' && (
                <div className="p-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 font-medium">Procesando tu reserva...</p>
                </div>
              )}

              {/* --- Vista de Éxito --- */}
              {reservationStatus === 'success' && (
                <div className="p-6 text-center space-y-4">
                  <p className="text-gray-800">¡Tus números han sido pre-reservados con éxito!</p>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-bold text-2xl text-blue-800 tracking-wider">{selectedNumbers.join(', ')}</p>
                  </div>
                  <p className="text-gray-600 text-sm">Para completar, contacta al organizador por WhatsApp y coordina el pago.</p>
                  {/* Mensaje de advertencia sobre el tiempo de pago */}
                  <p className="text-xs text-red-700 font-semibold bg-red-100 p-2 rounded-md border border-red-200">
                    Importante: Tienes 24 horas para realizar el pago. De lo contrario, los números volverán a estar disponibles.
                  </p>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-lg">
                    Contactar por WhatsApp ✅
                  </a>
                  <button onClick={handleCloseModal} className="text-sm text-gray-500 hover:text-gray-800 pt-2">Cerrar</button>
                </div>
              )}

              {/* --- Vista de Error --- */}
              {reservationStatus === 'error' && (
                <div className="p-6 text-center space-y-4">
                  <h3 className="text-xl font-bold text-red-600">❌ Ocurrió un Error</h3>
                  <p className="bg-red-100 text-red-800 p-3 rounded-lg">{reservationError}</p>
                  <button onClick={() => setReservationStatus('idle')} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    Intentar de Nuevo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;