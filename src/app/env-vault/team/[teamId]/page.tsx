"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { importPrivateKey, decryptTeamKey, arrayBufferToBase64, base64ToArrayBuffer } from "@/lib/crypto-team";
import { LockIcon, ShieldAlertIcon, SaveIcon, CopyIcon, UsersIcon } from "lucide-react";

export default function TeamWorkspaceDetail() {
  const params = useParams();
  const teamId = params.teamId as string;
  const supabase = createClient();

  const [team, setTeam] = useState<any>(null);
  const [vaults, setVaults] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  const [activeVault, setActiveVault] = useState<any>(null);
  const [decryptedEnv, setDecryptedEnv] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teamKey, setTeamKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // 1. Fetch Team Details
      const { data: teamData, error: teamErr } = await supabase.from('teams').select('*').eq('id', teamId).single();
      if (teamErr) throw teamErr;
      setTeam(teamData);

      // 2. Fetch Members
      const { data: memberData, error: memErr } = await supabase.from('team_members').select('*').eq('team_id', teamId);
      if (memErr) throw memErr;
      setMembers(memberData);

      // 3. Fetch Vaults
      const { data: vaultData, error: vaultErr } = await supabase.from('team_vaults').select('*').eq('team_id', teamId);
      if (vaultErr) throw vaultErr;
      setVaults(vaultData);

      // 4. Decrypt Team Key
      const myMemberRecord = memberData.find(m => m.user_id === userData.user?.id);
      if (myMemberRecord) {
        const privKeyBase64 = localStorage.getItem(`castov_priv_key_${userData.user.id}`);
        if (!privKeyBase64) {
          throw new Error("Private key missing from local storage. Cannot decrypt team data.");
        }
        
        const privateKey = await importPrivateKey(privKeyBase64);
        const tk = await decryptTeamKey(myMemberRecord.encrypted_team_key, privateKey);
        setTeamKey(tk);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVault = async (vault: any) => {
    setActiveVault(vault);
    if (!teamKey) return;
    
    try {
      const iv = base64ToArrayBuffer(vault.iv);
      const ciphertext = base64ToArrayBuffer(vault.encrypted_payload);
      
      const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, teamKey, ciphertext);
      const dec = new TextDecoder();
      setDecryptedEnv(dec.decode(decryptedBuffer));
    } catch (e) {
      console.error("Decryption failed", e);
      setDecryptedEnv("Error decrypting vault contents.");
    }
  };

  const handleSaveVault = async () => {
    if (!teamKey || !activeVault || !decryptedEnv) return;
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder();
      const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, teamKey, enc.encode(decryptedEnv));
      
      const payloadBase64 = arrayBufferToBase64(ciphertext);
      const ivBase64 = arrayBufferToBase64(iv.buffer as ArrayBuffer);

      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from('team_vaults')
        .update({ 
          encrypted_payload: payloadBase64, 
          iv: ivBase64, 
          updated_at: new Date().toISOString(),
          updated_by: userData.user?.id,
          version: activeVault.version + 1
        })
        .eq('id', activeVault.id);

      if (error) throw error;
      alert("Vault saved successfully!");
      loadTeamData();
    } catch (e) {
      console.error(e);
      alert("Error saving vault");
    }
  };

  const handleCreateVault = async () => {
    if (!teamKey) return;
    const name = prompt("Enter vault name (e.g. .env.production)");
    if (!name) return;

    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder();
      const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, teamKey, enc.encode("# New Vault"));
      
      const payloadBase64 = arrayBufferToBase64(ciphertext);
      const ivBase64 = arrayBufferToBase64(iv.buffer as ArrayBuffer);
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from('team_vaults').insert([{
        team_id: teamId,
        name,
        encrypted_payload: payloadBase64,
        iv: ivBase64,
        updated_by: userData.user?.id
      }]);

      if (error) throw error;
      loadTeamData();
    } catch (e) {
      console.error(e);
      alert("Error creating vault");
    }
  };

  if (loading) return <div className="text-fg p-12 text-center font-mono">Loading Workspace...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-8 min-h-screen">
      
      {/* Sidebar: Navigation & Members */}
      <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
        <div>
          <Link href="/env-vault/team" className="text-xs font-semibold text-muted hover:text-fg mb-4 inline-block">&larr; Back</Link>
          <h1 className="text-2xl font-bold text-fg tracking-tight">{team?.name}</h1>
          <p className="text-xs text-muted mt-1 font-mono">{team?.id}</p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex gap-3 text-danger text-sm">
            <ShieldAlertIcon size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-card border border-line rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-fg">Vaults</h3>
            <button onClick={handleCreateVault} className="text-xs bg-field border border-line hover:bg-hover px-2 py-1 rounded text-fg font-semibold transition-colors">+ New</button>
          </div>
          <div className="flex flex-col gap-2">
            {vaults.map(v => (
              <button 
                key={v.id} 
                onClick={() => handleOpenVault(v)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-mono transition-colors flex items-center justify-between group ${activeVault?.id === v.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted hover:bg-hover hover:text-fg border border-transparent'}`}
              >
                <span>{v.name}</span>
                <span className="text-[10px] bg-field px-1.5 py-0.5 rounded text-muted">v{v.version}</span>
              </button>
            ))}
            {vaults.length === 0 && <p className="text-xs text-muted italic">No vaults created.</p>}
          </div>
        </div>

        <div className="bg-card border border-line rounded-2xl p-5 shadow-sm">
           <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-fg flex items-center gap-2"><UsersIcon size={16} /> Members</h3>
            <button className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors">Invite</button>
          </div>
          <div className="flex flex-col gap-3">
            {members.map(m => (
              <div key={m.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-field border border-line flex items-center justify-center text-[10px] text-muted uppercase font-bold">
                    {m.role[0]}
                  </div>
                  <span className="text-xs font-mono text-muted truncate w-24" title={m.user_id}>{m.user_id.split('-')[0]}...</span>
                </div>
                <span className="flex h-2 w-2 rounded-full bg-success shadow-sm" title="Key Active" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 bg-card border border-line rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
        {!activeVault ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted p-8 text-center">
            <LockIcon size={48} className="mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-fg mb-2">Zero-Knowledge Encrypted</h2>
            <p className="text-sm max-w-sm">Select a vault from the sidebar to decrypt its contents directly in your browser.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center p-4 border-b border-line bg-field">
              <div className="flex items-center gap-3">
                <LockIcon size={16} className="text-success" />
                <h2 className="font-mono text-sm font-bold text-fg">{activeVault.name}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Decrypted Locally</span>
                <button onClick={() => navigator.clipboard.writeText(decryptedEnv)} className="p-1.5 text-muted hover:text-fg hover:bg-hover rounded transition-colors">
                  <CopyIcon size={16} />
                </button>
                <button onClick={handleSaveVault} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white dark:text-[#050505] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                  <SaveIcon size={14} /> Save
                </button>
              </div>
            </div>
            <textarea 
              value={decryptedEnv}
              onChange={e => setDecryptedEnv(e.target.value)}
              className="flex-1 w-full bg-transparent p-6 font-mono text-sm text-fg focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
            <div className="px-4 py-2 bg-field border-t border-line flex justify-between text-[10px] text-muted font-mono">
              <span>Last updated: {new Date(activeVault.updated_at).toLocaleString()}</span>
              <span>AES-GCM 256-bit</span>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
