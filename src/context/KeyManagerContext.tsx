"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [keys, setKeys] = useState<ApiKeys>({ openai: "", anthropic: "", gemini: "" });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isKeyModalOpen, setKeyModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("castov_api_keys");
    if (stored) {
      try {
        // Simple base64 decoding for basic obfuscation in local storage
        const decoded = atob(stored);
        setKeys(JSON.parse(decoded));
      } catch (e) {
        console.error("Failed to parse API keys");
      }
    }
    setIsLoaded(true);
  }, []);

  const persistKeys = (newKeys: ApiKeys) => {
    setKeys(newKeys);
    // Simple base64 encoding for basic obfuscation
    localStorage.setItem("castov_api_keys", btoa(JSON.stringify(newKeys)));
  };

  const saveKey = (provider: keyof ApiKeys, key: string) => {
    persistKeys({ ...keys, [provider]: key.trim() });
  };

  const removeKey = (provider: keyof ApiKeys) => {
    persistKeys({ ...keys, [provider]: "" });
  };

  if (!isLoaded) return null;

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
