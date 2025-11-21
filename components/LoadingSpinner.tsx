
import React from 'react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="w-16 h-16 border-4 border-t-4 border-t-green-500 border-gray-200 rounded-full animate-spin"></div>
    <p className="mt-4 text-lg text-gray-600">Analizando tus compras...</p>
  </div>
);

export default LoadingSpinner;
