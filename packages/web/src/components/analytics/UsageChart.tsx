import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UsageItem {
  name: string;
  count: number;
}

interface UsageChartProps {
  title: string;
  data: UsageItem[];
  emptyMessage?: string;
  colorScheme?: 'primary' | 'gradient';
}

const GRADIENT_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

function formatName(name: string): string {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function UsageChart({ 
  title, 
  data, 
  emptyMessage = 'No data yet',
  colorScheme = 'gradient' 
}: UsageChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item, index) => {
          const percentage = Math.round((item.count / total) * 100);
          const widthPercentage = Math.round((item.count / maxCount) * 100);
          const colorClass = colorScheme === 'gradient' 
            ? GRADIENT_COLORS[index % GRADIENT_COLORS.length]
            : 'bg-primary';

          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium truncate max-w-[200px]">
                  {formatName(item.name)}
                </span>
                <span className="text-muted-foreground">
                  {item.count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                  style={{ width: `${widthPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
