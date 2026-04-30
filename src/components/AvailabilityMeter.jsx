import React from 'react';

const AvailabilityMeter = ({ totalTickets, reservedCount }) => {
    const percentage = totalTickets > 0 ? Math.round((reservedCount / totalTickets) * 100) : 0;

    return (
        <div className="w-full mb-6">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-xl font-bold text-cyan-800">Disponibilidad de Tiquetes</h3>
                    <p className="text-sm text-cyan-600 font-medium">¡No te quedes por fuera del paraíso!</p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-extrabold text-blue-600 drop-shadow-sm">{percentage}%</span>
                    <span className="text-sm text-blue-500 block font-semibold">Reservados</span>
                </div>
            </div>

            <div className="w-full bg-cyan-100 rounded-full h-5 overflow-hidden shadow-inner border border-cyan-200">
                <div
                    className="bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out shadow-lg relative"
                    style={{ width: `${percentage}%` }}
                >
                    {/* Brillo en la barra */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-t-full"></div>
                </div>
            </div>
            <div className="flex justify-between text-xs font-medium text-cyan-700 mt-1">
                <span>{reservedCount} de {totalTickets}</span>
            </div>
        </div>
    );
};

export default AvailabilityMeter;
