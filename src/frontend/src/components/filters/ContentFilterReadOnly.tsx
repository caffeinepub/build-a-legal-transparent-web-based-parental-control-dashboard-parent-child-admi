import { useGetContentFilter } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Check, X } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

interface ContentFilterReadOnlyProps {
  childId: Principal | null;
}

export default function ContentFilterReadOnly({ childId }: ContentFilterReadOnlyProps) {
  const { data: filter, isLoading } = useGetContentFilter(childId);

  if (isLoading) {
    return <p className="text-muted-foreground text-center py-8">Loading...</p>;
  }

  if (!filter) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No content filter configured yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Your Content Filter Policy
        </CardTitle>
        <CardDescription>
          These are guidance policies set by your parent (not enforced on device)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {filter.categories.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-3">Content Categories</p>
            <div className="space-y-2">
              {filter.categories.map((category, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{category.name}</span>
                  {category.enabled ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Blocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Allowed
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {filter.allowlist.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Always Allowed</p>
            <div className="flex flex-wrap gap-2">
              {filter.allowlist.map((item, idx) => (
                <Badge key={idx} variant="outline" className="bg-green-50 dark:bg-green-950">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {filter.blocklist.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Blocked</p>
            <div className="flex flex-wrap gap-2">
              {filter.blocklist.map((item, idx) => (
                <Badge key={idx} variant="destructive">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
