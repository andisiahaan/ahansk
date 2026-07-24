'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Token { id: string; name: string; token_prefix: string; last_used_at: string | null; expires_at: string | null; created_at: string; }

export default function ApiKeysPage() {
  const [tokens, setTokens]   = useState<Token[]>([]);
  const [name, setName]       = useState('');
  const [expires, setExpires] = useState('');
  const [revealed, setRevealed] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get('/personal-access-tokens');
    setTokens(data.data?.items ?? (Array.isArray(data.data) ? data.data : []));
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/personal-access-tokens', { name, expires_at: expires || null });
      setRevealed(data.data.token);
      setName(''); setExpires('');
      await load();
    } catch { toast.error('Failed to create token.'); }
    finally { setSaving(false); }
  };

  const revoke = async (id: string) => {
    if (!confirm('Revoke this token? This cannot be undone.')) return;
    try {
      await api.delete(`/personal-access-tokens/${id}`);
      setTokens((p) => p.filter((t) => t.id !== id));
      toast.success('Token revoked.');
    } catch { toast.error('Failed to revoke token.'); }
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold text-foreground">API Keys</h1></div>

      {revealed && (
        <div className="mb-6 border border-success/30 bg-success/8 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-success">✓ Token created — copy it now, it won&apos;t be shown again.</p>
          <code className="block text-xs font-mono bg-muted p-3 rounded-lg break-all select-all">{revealed}</code>
          <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(revealed); toast.success('Copied!'); }}>Copy</Button>
          <Button variant="ghost" size="sm" onClick={() => setRevealed(null)}>Dismiss</Button>
        </div>
      )}

      <form onSubmit={create} className="flex flex-col gap-4 mb-8 border border-border rounded-xl p-5 bg-card">
        <h2 className="text-sm font-semibold text-foreground">Create new token</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Token name</Label>
            <Input placeholder="e.g. My Server" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Expires at (optional)</Label>
            <Input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} />
          </div>
        </div>
        <Button type="submit" loading={saving} className="w-fit">Generate Token</Button>
      </form>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full border-collapse min-w-[480px]">
          <thead className="bg-muted">
            <tr>
              {['Name', 'Prefix', 'Last Used', 'Expires', 'Action'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-widest text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-foreground">{t.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.token_prefix}…</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{t.last_used_at ? new Date(t.last_used_at).toLocaleDateString() : 'Never'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{t.expires_at ? new Date(t.expires_at).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3"><Button variant="destructive" size="sm" onClick={() => revoke(t.id)}>Revoke</Button></td>
              </tr>
            ))}
            {tokens.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No tokens yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
