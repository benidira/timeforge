"use client";

import React, { createContext, useContext, useState } from "react";

interface ApiKeys {
  openai: string;
  anthropic: string;
  gemini: string;
}

interface KeyManagerContextType {
  keys: ApiKeys;
  saveKey: (provider: keyof ApiKeys, key: string) => void;
  removeKey: (provider: keyof ApiKeys) => void;
  isKeyModalOpen: boolean;
  setKeyModalOpen: (open: boolean) => void;
}

const KeyManagerContext = createContext<KeyManagerContextType | undefined>(undefined);

export function KeyManagerProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = useState<ApiKeys>(() => {
    if (typeof window === "undefined") {
      return { openai: "", anthropic: "", gemini: "" };
    }
    try {
      const stored = localStorage.getItem("castov_api_keys");
      if (stored) {
        const decoded = atob(stored);
        return JSON.parse(decoded) as ApiKeys;
      }
    } catch {
      console.error("Failed to parse API keys");
    }
    return { openai: "", anthropic: "", gemini: "" };
  });

  const [isKeyModalOpen, setKeyModalOpen] = useState(false);

  const persistKeys = (newKeys: ApiKeys) => {
    setKeys(newKeys);
    localStorage.setItem("castov_api_keys", btoa(JSON.stringify(newKeys)));
  };

  const saveKey = (provider: keyof ApiKeys, key: string) => {
    persistKeys({ ...keys, [provider]: key.trim() });
  };

  const removeKey = (provider: keyof ApiKeys) => {
    persistKeys({ ...keys, [provider]: "" });
  };

  return (
    <KeyManagerContext.Provider value={{ keys, saveKey, removeKey, isKeyModalOpen, setKeyModalOpen }}>
      {children}
    </KeyManagerContext.Provider>
  );
}

export const useKeyManager = () => {
  const context = useContext(KeyManagerContext);
  if (context === undefined) {
    throw new Error("useKeyManager must be used within a KeyManagerProvider");
  }
  return context;
};
