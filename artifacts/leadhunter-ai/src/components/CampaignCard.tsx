import { Campaign } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, CheckCircle2, Trash2 } from "lucide-react";

interface CampaignCardProps {
  campaign: Campaign;
  onStatusChange: (id: string, status: Campaign['status']) => void;
  onDelete: (id: string) => void;
}

export default function CampaignCard({ campaign, onStatusChange, onDelete }: CampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20';
      case 'paused': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default: return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{campaign.name}</h3>
            <p className="text-sm text-muted-foreground">{campaign.businessType} • {campaign.location}</p>
          </div>
          <Badge className={getStatusColor(campaign.status)} variant="secondary">
            {campaign.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Messages</p>
            <p className="font-mono font-medium">{campaign.messagesGenerated}</p>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Leads</p>
            <p className="font-mono font-medium">{campaign.leadsTargeted}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <Badge variant="outline" className="uppercase">{campaign.messageType}</Badge>
          <div className="flex gap-2">
            {campaign.status !== 'active' && campaign.status !== 'completed' && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={() => onStatusChange(campaign.id, 'active')}>
                <Play className="w-4 h-4" />
              </Button>
            )}
            {campaign.status === 'active' && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10" onClick={() => onStatusChange(campaign.id, 'paused')}>
                <Pause className="w-4 h-4" />
              </Button>
            )}
            {campaign.status !== 'completed' && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10" onClick={() => onStatusChange(campaign.id, 'completed')}>
                <CheckCircle2 className="w-4 h-4" />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(campaign.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}