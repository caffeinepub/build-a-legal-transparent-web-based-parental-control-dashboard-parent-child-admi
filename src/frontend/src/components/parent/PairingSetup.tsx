import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Link2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function PairingSetup() {
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleGenerateCode = () => {
    // This would call the backend when the pairing functions are implemented
    const mockCode = `PAIR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setGeneratedCode(mockCode);
    toast.info('Note: Pairing requires backend implementation');
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      const url = `${window.location.origin}?pairingCode=${generatedCode}`;
      navigator.clipboard.writeText(url);
      toast.success('Pairing link copied to clipboard');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Pair with a Child
        </CardTitle>
        <CardDescription>
          Generate a pairing code for your child to connect their account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-900 dark:text-amber-100 text-sm">
            <strong>Backend Implementation Required:</strong> The pairing flow requires backend functions (generateParentInviteCode, redeemPairingCode) that are not yet implemented. This UI demonstrates the intended user experience.
          </AlertDescription>
        </Alert>

        {!generatedCode ? (
          <Button onClick={handleGenerateCode} className="w-full bg-amber-600 hover:bg-amber-700">
            Generate Pairing Code
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Your pairing code:</p>
              <p className="text-2xl font-mono font-bold text-center">{generatedCode}</p>
            </div>
            <Button onClick={handleCopyCode} variant="outline" className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              Copy Pairing Link
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Share this code with your child. It expires in 48 hours.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
