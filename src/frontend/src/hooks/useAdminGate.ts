import { useState, useEffect } from 'react';

const ADMIN_GATE_KEY = 'admin_gate_passed';

export function useAdminGate() {
  const [isGatePassed, setIsGatePassed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(ADMIN_GATE_KEY) === 'true';
  });

  const passGate = () => {
    sessionStorage.setItem(ADMIN_GATE_KEY, 'true');
    setIsGatePassed(true);
  };

  const clearGate = () => {
    sessionStorage.removeItem(ADMIN_GATE_KEY);
    setIsGatePassed(false);
  };

  return {
    isGatePassed,
    passGate,
    clearGate,
  };
}
