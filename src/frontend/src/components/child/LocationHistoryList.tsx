import { useState } from 'react';
import { useGetLocations } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useI18n } from '../../hooks/useI18n';
import { ExternalLink } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

interface LocationHistoryListProps {
  childId: Principal | null;
  showTransparencyLabel?: boolean;
  refetchInterval?: number;
}

export default function LocationHistoryList({ childId, showTransparencyLabel = false, refetchInterval }: LocationHistoryListProps) {
  const { identity } = useInternetIdentity();
  const { t } = useI18n();
  const effectiveChildId = childId || (identity ? identity.getPrincipal() : null);
  const { data: locations = [], isLoading } = useGetLocations(effectiveChildId, { refetchInterval });
  const [selectedLimit, setSelectedLimit] = useState<string>('all');

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">{t('locationHistoryLoading')}</div>;
  }

  if (locations.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">{t('locationHistoryEmpty')}</div>;
  }

  // Sort by timestamp descending (most recent first)
  const sortedLocations = [...locations].sort((a, b) => Number(b.timestamp - a.timestamp));

  // Apply limit based on selected tab
  const displayedLocations = selectedLimit === 'all' 
    ? sortedLocations 
    : sortedLocations.slice(0, parseInt(selectedLimit));

  return (
    <div className="space-y-4">
      {showTransparencyLabel && (
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
          {t('locationHistoryTransparencyLabel')}
        </Badge>
      )}
      
      <Tabs value={selectedLimit} onValueChange={setSelectedLimit} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="10">{t('locationHistoryLimit10')}</TabsTrigger>
          <TabsTrigger value="30">{t('locationHistoryLimit30')}</TabsTrigger>
          <TabsTrigger value="50">{t('locationHistoryLimit50')}</TabsTrigger>
          <TabsTrigger value="all">{t('locationHistoryLimitAll')}</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedLimit} className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('locationHistoryLatitude')}</TableHead>
                  <TableHead>{t('locationHistoryLongitude')}</TableHead>
                  <TableHead>{t('locationHistoryTimestamp')}</TableHead>
                  <TableHead className="text-right">{t('locationHistoryActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedLocations.map((location, index) => {
                  const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{location.latitude.toFixed(6)}</TableCell>
                      <TableCell className="font-mono">{location.longitude.toFixed(6)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(Number(location.timestamp) / 1_000_000).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={mapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {t('locationHistoryViewInMaps')}
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
