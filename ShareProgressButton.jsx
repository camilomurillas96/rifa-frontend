import { useState } from 'react';
import html2canvas from 'html2canvas';

/**
 * Un botón flotante que toma una captura de pantalla de un elemento específico y
 * permite compartirla usando la Web Share API o descargarla si la API no está disponible.
 *
 * @param {{targetElementId: string, isReserveButtonActive?: boolean}} props
 * @param {string} props.targetElementId El ID del elemento del DOM que se va a capturar.
 * @param {boolean} [props.isReserveButtonActive=false] Indica si el botón de reserva está activo para ajustar la posición.
 */
function ShareProgressButton({ targetElementId, isReserveButtonActive = false }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    const elementToCapture = document.getElementById(targetElementId);

    if (!elementToCapture) {
      console.error(`Elemento con id "${targetElementId}" no encontrado.`);
      alert('Error: No se pudo encontrar el contenido para compartir.');
      return;
    }

    setIsLoading(true);

    try {
      const canvas = await html2canvas(elementToCapture, {
        // Opciones para mejorar la calidad de la imagen
        useCORS: true, // Necesario si tienes imágenes de otros dominios
        scale: 2,      // Aumenta la resolución de la captura
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('No se pudo generar la imagen.');
        }

        const file = new File([blob], 'progreso-rifa.png', { type: 'image/png' });
        const shareData = {
          files: [file],
          title: '¡Mira mi progreso en la rifa!',
          text: '¡Estoy participando en esta increíble rifa!',
        };

        // Comprobar si la Web Share API puede compartir archivos
        if (navigator.canShare && navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
          } catch (error) {
            // El usuario canceló el diálogo de compartir, no es un error real.
            if (error.name !== 'AbortError') {
              console.error('Error al compartir:', error);
              throw error; // Lanza para que se active el fallback de descarga
            }
          }
        } else {
          // Fallback: descargar la imagen en escritorio
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'progreso-rifa.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }
      }, 'image/png');

    } catch (error) {
      console.error('Error al generar la imagen:', error);
      alert('Hubo un problema al generar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      className={`fixed right-6 z-50 flex items-center gap-3 px-6 py-3 font-bold text-white transition-all duration-300 ease-in-out transform rounded-full shadow-lg bg-gradient-to-br from-cyan-400 to-blue-600 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 ${isReserveButtonActive ? 'bottom-24' : 'bottom-6'}`}
    >
      {isLoading ? (
        <>
          <span>Generando imagen...</span>
          <span className="animate-spin">⏳</span>
        </>
      ) : (
        <>
          <span>¡Reportar Progreso!</span>
          <span>📸</span>
        </>
      )}
    </button>
  );
}

export default ShareProgressButton;