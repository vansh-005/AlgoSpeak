import React, { createContext, useContext, useState } from "react";

export const CooldownContext = createContext();

export function useCooldown() {
  return useContext(CooldownContext);
}

export function CooldownProvider({ children }) {
  const [isCooldown, setIsCooldown] = useState(false);

  return (
    <CooldownContext.Provider value={{ isCooldown, setIsCooldown }}>
      {children}
    </CooldownContext.Provider>
  );
}
