import React from 'react';

/**
 * Componente de carga visual (Spinner) para indicar que la aplicación está procesando datos.
 * Muestra un spinner de doble anillo y un mensaje animado, diseñado para encajar en
 * la temática de la rifa.
 *
 * @returns {JSX.Element} El componente de spinner.
 */
const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Contenedor del Spinner con posicionamiento relativo para superponer los anillos */}
      <div className="relative h-20 w-20">
        {/* Anillo exterior estático (la "pista" del spinner) con un color semitransparente */}
        <div className="absolute h-full w-full rounded-full border-4 border-solid border-cyan-500/20"></div>
        {/* Anillo giratorio (indicador de progreso) que anima sobre la pista */}
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-solid border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent"></div>
      </div>
      <p className="mt-6 text-center font-medium text-cyan-800 animate-pulse">
        Preparando tus números de la suerte... 🌴
      </p>
    </div>
  );
};

export default LoadingSpinner;