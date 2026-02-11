import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Shield, Eye, Lock, UserCheck, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransparencyPoliciesProps {
  onClose: () => void;
}

export default function TransparencyPolicies({ onClose }: TransparencyPoliciesProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="w-6 h-6 text-amber-600" />
                Transparency & Policies
              </CardTitle>
              <CardDescription>
                How FamilyGuard protects privacy and ensures transparency
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-600" />
                Supervision Disclosure
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FamilyGuard is a <strong>consent-based, transparent</strong> parental guidance platform. Children are always aware when supervision is active. All data sharing requires explicit consent from the child at the time of submission.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Parents can view only the information that children voluntarily submit through the check-in system. There is <strong>no hidden monitoring, no background tracking, and no covert surveillance</strong>.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                Data Handling
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                All data is stored securely on the Internet Computer blockchain with end-to-end encryption. Only authorized family members can access shared information:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
                <li>Children can view their own submitted data</li>
                <li>Parents can view data from their linked children only</li>
                <li>Admins can view aggregated metrics but not individual child content</li>
                <li>No third parties have access to family data</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-600" />
                Consent Requirements
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every data submission requires explicit consent:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
                <li><strong>Pairing:</strong> Child must confirm they understand supervision before linking to a parent</li>
                <li><strong>Activity:</strong> Each activity entry is manually submitted by the child</li>
                <li><strong>Location:</strong> Each location share requires a consent checkbox</li>
                <li><strong>Transparency:</strong> Children can always see what data has been shared and when</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                What FamilyGuard Does NOT Do
              </h3>
              <div className="bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                <p className="text-sm text-rose-900 dark:text-rose-100 font-semibold mb-2">
                  This platform explicitly does NOT support:
                </p>
                <ul className="text-sm text-rose-900 dark:text-rose-100 space-y-1 ml-6 list-disc">
                  <li>Screen mirroring or remote screen viewing</li>
                  <li>Remote camera or microphone access</li>
                  <li>Hidden or covert monitoring</li>
                  <li>Keylogging or message interception</li>
                  <li>Background location tracking without consent</li>
                  <li>Notification suppression or stealth mode</li>
                </ul>
                <p className="text-sm text-rose-900 dark:text-rose-100 mt-3">
                  These features are intentionally excluded to comply with privacy laws and ethical standards.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Account Recovery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FamilyGuard uses Internet Identity for authentication. Account recovery follows Internet Identity's secure recovery mechanisms. We do not email passwords or store password recovery tokens.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold">Legal Compliance</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FamilyGuard is designed to comply with:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Brazil's Estatuto Digital da Criança e do Adolescente (Lei 15.211/2025)</li>
                <li>GDPR privacy requirements</li>
                <li>COPPA child privacy protections</li>
                <li>"Safety by design" principles</li>
              </ul>
            </section>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Last updated: February 2026
              </p>
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
