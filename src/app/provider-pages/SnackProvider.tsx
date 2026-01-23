'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';


const SuccessIcon = () => (
  <svg className="h-8 w-8 text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd"/>
  </svg>
);

const ErrorIcon = () => (
  <svg className="h-6 w-6 text-red-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clipRule="evenodd"/>
  </svg>
);

type Variant = 'success' | 'error';

interface SnackContextType {
  createSnack: (message: any, variant: Variant) => void;
}

const SnackContext = createContext<SnackContextType | undefined>(undefined);

export const useSnack = (): SnackContextType => {
  const context = useContext(SnackContext);
  if (!context) {
    throw new Error('useSnack must be used within a SnackProvider');
  }
  return context;
};

interface SnackProviderProps {
  children: ReactNode;
}

interface Snack {
  id: number;
  message: string | React.JSX.Element;
  variant: Variant;
  visible: boolean;
}

export const SnackProvider: React.FC<SnackProviderProps> = ({ children }) => {
  const [snacks, setSnacks] = useState<Snack[]>([]);

  const createSnack = useCallback((message: any, variant: 'success' | 'error') => {
    const id = Date.now();
    const newSnack = { id, message, variant, visible: true };
    setSnacks([newSnack]);

    setTimeout(() => {
      setSnacks((prevSnacks) =>
        prevSnacks.map((snack) =>
          snack.id === id ? { ...snack, visible: false } : snack,
        ),
      );
    }, 2500);

    setTimeout(() => {
      setSnacks((prevSnacks) => prevSnacks.filter((snack) => snack.id !== id));
    }, 3000);
  }, []);

  return (
    <SnackContext.Provider value={{ createSnack }}>
      {children}
      <div>
        {snacks.map((snack) => (
          <div
            key={snack.id}
            className={`${snack.visible ? 'opacity-100' : 'translate-y-10 opacity-0'} absolute bottom-4 left-4 z-50 flex items-center space-x-4 divide-x divide-slate-200 rounded-xl bg-white p-4 pr-5 text-slate-500 shadow transition-all duration-500 ease-in-out`}
            role="alert"
          >
            {getVariantIcon(snack.variant)}
            <div className="max-w-md text-ellipsis ps-4 font-normal ">{snack.message}</div>
          </div>
        ))}
      </div>
    </SnackContext.Provider>
  );
};

const getVariantIcon = (variant: Variant) => {
  switch (variant) {
  case 'success':
    return <SuccessIcon />;
  case 'error':
    return <ErrorIcon />;
  default:
    throw new Error(`Unknown variant: ${variant}`);
  }
};