import { Badge } from "@/components/ui/badge";

export default function ScoreBadge({ score }: { score: number }) {
  let colorClass = "bg-destructive/10 text-destructive border-destructive/20";
  let label = "Low";
  
  if (score >= 70) {
    colorClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    label = "High";
  } else if (score >= 40) {
    colorClass = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    label = "Medium";
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={`${colorClass} font-mono font-bold px-2 py-0.5`}>
        {score}
      </Badge>
      <span className="text-xs text-muted-foreground">{label} Opp</span>
    </div>
  );
}