import { useState, useEffect } from 'react';
import { useGetContentFilter, useUpdateContentFilter } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';
import type { ContentFilterConfig, ContentCategory } from '../../backend';
import { useI18n } from '../../hooks/useI18n';

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
  const { t } = useI18n();
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
          <strong>{t('filterEditorNote')}</strong> {t('filterEditorNoteBody')}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>{t('filterEditorTitle')}</CardTitle>
          <CardDescription>{t('filterEditorDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">{t('filterEditorCategories')}</h3>
            <div className="space-y-3">
              {categories.map((category, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{category.name}</span>
                  <Switch checked={category.enabled} onCheckedChange={() => toggleCategory(idx)} />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowlist">{t('filterEditorAllowlist')}</Label>
            <Input
              id="allowlist"
              value={allowlist}
              onChange={(e) => setAllowlist(e.target.value)}
              placeholder={t('filterEditorAllowlistPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blocklist">{t('filterEditorBlocklist')}</Label>
            <Input
              id="blocklist"
              value={blocklist}
              onChange={(e) => setBlocklist(e.target.value)}
              placeholder={t('filterEditorBlocklistPlaceholder')}
            />
          </div>

          <Button onClick={handleSave} disabled={updateFilter.isPending} className="w-full bg-amber-600 hover:bg-amber-700">
            {updateFilter.isPending ? t('filterEditorSaving') : t('filterEditorSaveButton')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
