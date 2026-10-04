"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
}

export interface SavedConfig {
  id: string;
  workspaceId: string;
  toolSlug: string;
  title: string;
  content: string;
  language: string;
  createdAt: number;
  updatedAt: number;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  savedConfigs: SavedConfig[];
  user: User | null;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  createWorkspace: (name: string) => void;
  switchWorkspace: (workspaceId: string) => void;
  saveToolConfig: (params: { toolSlug: string; title: string; content: string; language: string }) => void;
  deleteSavedConfig: (configId: string) => void;
  getWorkspaceConfigs: (workspaceId: string) => SavedConfig[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("");
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Auth & LocalStorage
  useEffect(() => {
    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));

    // Local Storage Init
    const storedWorkspaces = localStorage.getItem("castov_workspaces");
    const storedActive = localStorage.getItem("castov_active_workspace");
    const storedConfigs = localStorage.getItem("castov_saved_configs");

    let initialWorkspaces = storedWorkspaces ? JSON.parse(storedWorkspaces) : [];
    let initialActive = storedActive || "";

    if (initialWorkspaces.length === 0) {
      const defaultWs: Workspace = { id: "ws_personal", name: "Personal Workspace", createdAt: Date.now() };
      initialWorkspaces = [defaultWs];
      initialActive = "ws_personal";
    }

    setWorkspaces(initialWorkspaces);
    setActiveWorkspaceId(initialActive);
    setSavedConfigs(storedConfigs ? JSON.parse(storedConfigs) : []);
    setIsLoaded(true);

    return () => subscription.unsubscribe();
  }, []);

  // Sync to LocalStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("castov_workspaces", JSON.stringify(workspaces));
    localStorage.setItem("castov_active_workspace", activeWorkspaceId);
    localStorage.setItem("castov_saved_configs", JSON.stringify(savedConfigs));
    
    // Cloud Sync (Optimistic)
    if (user) {
      // In a full production app, we would sync these to the Supabase tables
      // using upsert operations based on timestamps.
      // e.g. supabase.from('workspaces').upsert(workspaces)
    }
  }, [workspaces, activeWorkspaceId, savedConfigs, isLoaded, user]);

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github' });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const createWorkspace = (name: string) => {
    const newWs: Workspace = {
      id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim() || "New Workspace",
      createdAt: Date.now()
    };
    setWorkspaces([...workspaces, newWs]);
    setActiveWorkspaceId(newWs.id);
  };

  const switchWorkspace = (workspaceId: string) => {
    if (workspaces.find(w => w.id === workspaceId)) {
      setActiveWorkspaceId(workspaceId);
    }
  };

  const saveToolConfig = ({ toolSlug, title, content, language }: { toolSlug: string; title: string; content: string; language: string }) => {
    const newConfig: SavedConfig = {
      id: `cfg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      workspaceId: activeWorkspaceId,
      toolSlug,
      title: title.trim() || "Untitled Config",
      content,
      language,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSavedConfigs([...savedConfigs, newConfig]);
  };

  const deleteSavedConfig = (configId: string) => {
    setSavedConfigs(savedConfigs.filter(c => c.id !== configId));
  };

  const getWorkspaceConfigs = (workspaceId: string) => {
    return savedConfigs.filter(c => c.workspaceId === workspaceId).sort((a, b) => b.updatedAt - a.updatedAt);
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <WorkspaceContext.Provider value={{
      workspaces, activeWorkspaceId, savedConfigs, user,
      signInWithGithub, signOut, createWorkspace, switchWorkspace, saveToolConfig, deleteSavedConfig, getWorkspaceConfigs
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
