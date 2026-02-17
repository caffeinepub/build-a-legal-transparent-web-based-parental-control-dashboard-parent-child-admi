import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { useSaveProfilePhoto } from '../../hooks/useQueries';
import { ExternalBlob } from '../../backend';
import { toast } from 'sonner';

interface ChangeProfilePhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhoto?: ExternalBlob;
}

export default function ChangeProfilePhotoDialog({ 
  open, 
  onOpenChange,
  currentPhoto 
}: ChangeProfilePhotoDialogProps) {
  const { t } = useI18n();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savePhotoMutation = useSaveProfilePhoto();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('photoDialogErrorInvalidType'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('photoDialogErrorTooLarge'));
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await savePhotoMutation.mutateAsync(blob);
      handleClear();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save photo:', error);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      // Save empty photo (null) to remove current photo
      const emptyBlob = ExternalBlob.fromBytes(new Uint8Array(0));
      await savePhotoMutation.mutateAsync(emptyBlob);
      handleClear();
      onOpenChange(false);
      toast.success(t('photoDialogRemoveSuccess'));
    } catch (error) {
      console.error('Failed to remove photo:', error);
    }
  };

  const currentPhotoUrl = currentPhoto ? currentPhoto.getDirectURL() : null;
  const displayUrl = previewUrl || currentPhotoUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('photoDialogTitle')}</DialogTitle>
          <DialogDescription>{t('photoDialogDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            {displayUrl ? (
              <div className="relative">
                <img 
                  src={displayUrl} 
                  alt="Preview" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 rounded-full w-8 h-8"
                  onClick={handleClear}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                <Camera className="w-12 h-12 text-muted-foreground" />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={savePhotoMutation.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              {t('photoDialogSelectFile')}
            </Button>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{t('photoDialogUploading')}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentPhotoUrl && !selectedFile && (
            <Button
              variant="outline"
              onClick={handleRemovePhoto}
              disabled={savePhotoMutation.isPending}
              className="text-destructive hover:text-destructive"
            >
              {t('photoDialogRemove')}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              handleClear();
              onOpenChange(false);
            }}
            disabled={savePhotoMutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedFile || savePhotoMutation.isPending}
          >
            {savePhotoMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('photoDialogSave')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
