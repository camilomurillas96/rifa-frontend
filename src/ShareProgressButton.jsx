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

        // --- SOLUCIÓN DEFINITIVA: Capturar el contenido completo del área designada ---
        // Ahora que tenemos un `targetElementId` que apunta a un área específica,
        // podemos capturar su altura y anchura completas sin miedo a que la imagen
        // sea demasiado larga (porque no incluye los T&C) o demasiado corta.
        width: elementToCapture.scrollWidth,
        height: elementToCapture.scrollHeight,
        windowWidth: elementToCapture.scrollWidth,
        windowHeight: elementToCapture.scrollHeight,
        // El scroll al inicio (0,0) asegura que la captura sea consistente.
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
      className="flex items-center justify-center p-4 text-3xl transition-transform duration-200 transform bg-white/20 backdrop-blur-sm rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span className="animate-spin text-2xl">⏳</span>
      ) : (
        <span>📸 Compartir progreso</span>
      )}
    </button>
  );
}

export default ShareProgressButton;