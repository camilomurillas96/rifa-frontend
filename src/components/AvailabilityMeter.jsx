import React from 'react';

const AvailabilityMeter = ({ totalTickets, reservedCount }) => {
    const percentage = totalTickets > 0 ? Math.round((reservedCount / totalTickets) * 100) : 0;

    return (
        <div className="w-full mb-6">
            <div className="flex justify-between items-end mb-3">
                <div>
                    <h3 className="text-xl font-bold text-cyan-800">🌊 Progreso del Viaje</h3>
                    <p className="text-sm text-cyan-600 font-medium">¡Quedan pocos puestos para la playa!</p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-extrabold text-blue-600 drop-shadow-sm">{percentage}%</span>
                    <span className="text-sm text-blue-400 block font-semibold">Vendidos</span>
                </div>
            </div>

            <div className="w-full bg-cyan-100 rounded-full h-6 overflow-hidden shadow-inner border border-cyan-200 mb-2">
                <div
                    className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-lg relative"
                    style={{ width: `${percentage}%` }}
                >
                    {/* Brillo en la barra */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-full"></div>
                </div>
            </div>

            <div className="flex justify-between text-xs font-medium text-cyan-600/70">
                <span>0</span>
                <span>{reservedCount} / {totalTickets} tickets</span>
                <span>{totalTickets}</span>
            </div>
        </div>
    );
};

export default AvailabilityMeter;
