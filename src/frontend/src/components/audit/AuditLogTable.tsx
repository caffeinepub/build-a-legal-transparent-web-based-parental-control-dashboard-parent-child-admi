import { useGetAuditLog } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { ActionType } from '../../backend';
import type { Principal } from '@icp-sdk/core/principal';

interface AuditLogTableProps {
  childId: Principal;
}

const getActionLabel = (action: ActionType): string => {
  switch (action) {
    case ActionType.pairingCreated:
      return 'Pairing Created';
    case ActionType.scheduleChanged:
      return 'Schedule Updated';
    case ActionType.filterChanged:
      return 'Filter Updated';
    case ActionType.accountDisabled:
      return 'Account Disabled';
    default:
      return 'Unknown Action';
  }
};

export default function AuditLogTable({ childId }: AuditLogTableProps) {
  const { data: auditLog = [], isLoading } = useGetAuditLog(childId);

  if (isLoading) {
    return <p className="text-muted-foreground text-center py-8">Loading...</p>;
  }

  if (auditLog.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No audit events yet</p>
      </div>
    );
  }

  const sortedLog = [...auditLog].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Executor</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLog.map((entry, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Badge variant="outline">{getActionLabel(entry.action)}</Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {entry.executor.toString().slice(0, 16)}...
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(Number(entry.timestamp) / 1_000_000).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
