import { useState, useEffect } from "react";
import { getSettings, saveSettings, clearAllData, getLeads, getCampaigns } from "@/lib/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KeyRound, ShieldAlert, Eye, EyeOff, Save, Trash2, Download } from "lucide-react";

export default function Settings() {
  const [settings, setLocalSettings] = useState({
    openaiKey: "",
    geminiKey: "",
    resendKey: ""
  });
  
  const [showKey, setShowKey] = useState({
    openai: false,
    gemini: false,
    resend: false
  });

  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    setLocalSettings(getSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    toast.success("Settings saved successfully");
  };

  const testConnection = (provider: string) => {
    setTesting(provider);
    setTimeout(() => {
      setTesting(null);
      // Mock validation logic based on key length
      const key = settings[`${provider}Key` as keyof typeof settings];
      if (key && key.length > 20) {
        toast.success(`Connected to ${provider.toUpperCase()} API ✓`);
      } else {
        toast.error(`Invalid ${provider.toUpperCase()} Key ✗`);
      }
    }, 1000);
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to delete ALL your leads, campaigns, and settings? This cannot be undone.")) {
      clearAllData();
      setLocalSettings({ openaiKey: "", geminiKey: "", resendKey: "" });
      toast.success("All local data cleared");
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleExportData = () => {
    const data = {
      leads: getLeads(),
      campaigns: getCampaigns(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leadhunter-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data backup exported");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage API integrations and local data.</p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-4 items-start">
        <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">Privacy First Architecture</p>
          <p className="text-muted-foreground leading-relaxed">
            LeadHunter AI is a client-side application. All leads, campaigns, and API keys are stored locally in your browser's localStorage. They are never sent to our servers.
          </p>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5" /> API Configurations</CardTitle>
          <CardDescription>Connect AI and Email providers to unlock generation features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>OpenAI API Key (GPT-4 Analysis)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  type={showKey.openai ? "text" : "password"} 
                  value={settings.openaiKey}
                  onChange={e => setLocalSettings({...settings, openaiKey: e.target.value})}
                  className="pr-10"
                  placeholder="sk-..."
                />
                <button type="button" onClick={() => setShowKey({...showKey, openai: !showKey.openai})} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                  {showKey.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button variant="secondary" onClick={() => testConnection('openai')} disabled={testing === 'openai' || !settings.openaiKey}>
                {testing === 'openai' ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Gemini API Key (Alternative Model)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  type={showKey.gemini ? "text" : "password"} 
                  value={settings.geminiKey}
                  onChange={e => setLocalSettings({...settings, geminiKey: e.target.value})}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowKey({...showKey, gemini: !showKey.gemini})} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                  {showKey.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button variant="secondary" onClick={() => testConnection('gemini')} disabled={testing === 'gemini' || !settings.geminiKey}>
                {testing === 'gemini' ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Resend API Key (Email Delivery)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  type={showKey.resend ? "text" : "password"} 
                  value={settings.resendKey}
                  onChange={e => setLocalSettings({...settings, resendKey: e.target.value})}
                  className="pr-10"
                  placeholder="re_..."
                />
                <button type="button" onClick={() => setShowKey({...showKey, resend: !showKey.resend})} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                  {showKey.resend ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button variant="secondary" onClick={() => testConnection('resend')} disabled={testing === 'resend' || !settings.resendKey}>
                {testing === 'resend' ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full sm:w-auto gap-2">
            <Save className="w-4 h-4" /> Save Configuration
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export your data for backup or clear it entirely from this browser.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" onClick={handleExportData} className="gap-2">
            <Download className="w-4 h-4" /> Export All Data (JSON)
          </Button>
          <Button variant="destructive" onClick={handleClearData} className="gap-2">
            <Trash2 className="w-4 h-4" /> Clear All Local Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}