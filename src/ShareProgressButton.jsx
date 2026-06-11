import { useState } from 'react';
import html2canvas from 'html2canvas';

/**
 * Un botón que toma una captura de pantalla de un elemento específico y
 * permite compartirla usando la Web Share API o descargarla si la API no está disponible.
 *
 * @param {string} props.targetElementId El ID del elemento del DOM que se va a capturar.
 */
function ShareProgressButton({ targetElementId }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    const elementToCapture = document.getElementById(targetElementId);

    if (!elementToCapture) {
      console.error(`Elemento con id "${targetElementId}" no encontrado.`);
      alert('Error: No se pudo encontrar el contenido para compartir.');
      return;
    }

    setIsLoading(true);

    // Guardamos la posición actual del scroll para restaurarla después.
    const originalScrollY = window.scrollY;
    // Hacemos scroll al inicio para asegurar una captura completa y consistente.
    window.scrollTo(0, 0);

    try {
      const canvas = await html2canvas(elementToCapture, {
        useCORS: true, // Necesario si tienes imágenes de otros dominios
        scale: 2,      // Aumenta la resolución de la captura

        // --- CORRECCIÓN: Opciones para capturar el contenido completo con scroll ---
        // Usamos scrollHeight y scrollWidth para que el canvas tenga el tamaño total del contenido.
        width: elementToCapture.scrollWidth,
        height: elementToCapture.scrollHeight,

        // Es buena práctica definir el contexto de la ventana para el renderizado.
        windowWidth: elementToCapture.scrollWidth,
        windowHeight: elementToCapture.scrollHeight,
        
        // Aseguramos que la "cámara" virtual esté en la posición correcta (arriba del todo).
        scrollX: 0,
        scrollY: 0,
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
      // ¡Muy importante! Restauramos la posición original del scroll para no afectar al usuario.
      window.scrollTo(0, originalScrollY);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      title="Compartir progreso"
      // Estilo modificado para ser más pequeño y discreto, con texto.
      className="flex items-center justify-center gap-2 px-4 py-2 mt-8 text-white transition-colors duration-200 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <span className="animate-spin text-lg">⏳</span>
          <span className="text-sm font-medium">Generando...</span>
        </>
      ) : (
        <>
          <span className="text-lg">📸</span>
          <span className="text-sm font-medium">Compartir con amigos</span>
        </>
      )}
    </button>
  );
}

export default ShareProgressButton;