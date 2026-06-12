import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface MessageGeneratorProps {
  message: string;
  onRegenerate: () => void;
  isGenerating?: boolean;
}

export default function MessageGenerator({ message, onRegenerate, isGenerating = false }: MessageGeneratorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-card/50 border-primary/20 shadow-lg shadow-primary/5">
      <CardContent className="p-0">
        <div className="bg-muted/30 px-4 py-2 border-b border-border/50 flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Output</span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs" 
              onClick={onRegenerate}
              disabled={isGenerating || !message}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
              Regen
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              className="h-7 text-xs bg-primary/20 text-primary hover:bg-primary/30 shadow-none" 
              onClick={handleCopy}
              disabled={isGenerating || !message}
            >
              {copied ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
        <div className="p-4 min-h-[200px]">
          {message ? (
            <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
              {message}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-12">
              Generate a message to see output here.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}