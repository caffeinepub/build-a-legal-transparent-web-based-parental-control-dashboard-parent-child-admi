import { useState, useEffect } from 'react';
import { useGetContentFilter, useUpdateContentFilter } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';
import type { ContentFilterConfig, ContentCategory } from '../../backend';

interface ContentFilterEditorProps {
  childId: Principal;
}

const DEFAULT_CATEGORIES = [
  { name: 'Adult Content', enabled: true },
  { name: 'Violence', enabled: true },
  { name: 'Gambling', enabled: true },
  { name: 'Social Media', enabled: false },
  { name: 'Gaming', enabled: false },
];

export default function ContentFilterEditor({ childId }: ContentFilterEditorProps) {
  const { data: filter } = useGetContentFilter(childId);
  const updateFilter = useUpdateContentFilter();

  const [categories, setCategories] = useState<ContentCategory[]>(DEFAULT_CATEGORIES);
  const [allowlist, setAllowlist] = useState('');
  const [blocklist, setBlocklist] = useState('');

  useEffect(() => {
    if (filter) {
      setCategories(filter.categories.length > 0 ? filter.categories : DEFAULT_CATEGORIES);
      setAllowlist(filter.allowlist.join(', '));
      setBlocklist(filter.blocklist.join(', '));
    }
  }, [filter]);

  const handleSave = () => {
    const config: ContentFilterConfig = {
      categories,
      allowlist: allowlist.split(',').map((s) => s.trim()).filter(Boolean),
      blocklist: blocklist.split(',').map((s) => s.trim()).filter(Boolean),
    };
    updateFilter.mutate({ childId, config });
  };

  const toggleCategory = (index: number) => {
    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], enabled: !newCategories[index].enabled };
    setCategories(newCategories);
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-900 dark:text-amber-100 text-sm">
          <strong>Note:</strong> This is a transparency policy only. It does not enforce device-level blocking. Your child can see these settings.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Content Categories
          </CardTitle>
          <CardDescription>Enable or disable content categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor={`cat-${idx}`} className="cursor-pointer">
                {category.name}
              </Label>
              <Switch
                id={`cat-${idx}`}
                checked={category.enabled}
                onCheckedChange={() => toggleCategory(idx)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Allowlist</CardTitle>
          <CardDescription>Sites/apps always allowed (comma-separated)</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={allowlist}
            onChange={(e) => setAllowlist(e.target.value)}
            placeholder="e.g., khanacademy.org, duolingo.com"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Blocklist</CardTitle>
          <CardDescription>Sites/apps to block (comma-separated)</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={blocklist}
            onChange={(e) => setBlocklist(e.target.value)}
            placeholder="e.g., example.com, badsite.net"
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updateFilter.isPending} className="w-full bg-amber-600 hover:bg-amber-700">
        {updateFilter.isPending ? 'Saving...' : 'Save Content Filter'}
      </Button>
    </div>
  );
}
