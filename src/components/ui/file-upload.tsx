import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  isUploading?: boolean;
  uploadProgress?: number;
  currentFile?: string | null;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx',
  maxSize = 10,
  isUploading = false,
  uploadProgress = 0,
  currentFile = null,
  placeholder = 'Выберите файл или перетащите сюда',
  className,
  variant = 'default',
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Файл слишком большой. Максимальный размер: ${maxSize}MB`);
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = accept.split(',').map(type => type.trim());
    
    if (!acceptedTypes.includes(fileExtension)) {
      setError('Неподдерживаемый тип файла');
      return;
    }

    onFileSelect(file);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearError = () => setError(null);

  if (variant === 'minimal') {
    return (
      <div className={cn("space-y-2", className)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className="h-8 text-xs"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary border-t-transparent mr-2" />
              загрузка...
            </>
          ) : (
            <>
              <Upload className="h-3 w-3 mr-1" />
              выбрать файл
            </>
          )}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="icon" onClick={clearError} className="h-4 w-4">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer",
            isDragOver ? "border-primary bg-primary/5" : "border-border/50 hover:border-border",
            disabled || isUploading ? "opacity-50 cursor-not-allowed" : "",
            currentFile ? "border-green-200 bg-green-50" : ""
          )}
        >
          <div className="flex items-center gap-3">
            {isUploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            ) : currentFile ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {isUploading ? `Загрузка... ${uploadProgress}%` : 
                 currentFile ? 'Файл загружен' : 
                 'Загрузить файл'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentFile || placeholder}
              </p>
            </div>
          </div>
          
          {isUploading && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-b-lg overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        
        {error && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              <span>{error}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={clearError} className="h-4 w-4">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("space-y-3", className)}>
      <Card
        className={cn(
          "relative border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden",
          isDragOver ? "border-primary bg-primary/5 shadow-md" : "border-border/50 hover:border-border hover:shadow-sm",
          disabled || isUploading ? "opacity-50 cursor-not-allowed" : "",
          currentFile ? "border-green-200 bg-green-50" : ""
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-3">
            {isUploading ? (
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">{uploadProgress}%</span>
                </div>
              </div>
            ) : currentFile ? (
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                {isDragOver && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                )}
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {isUploading ? 'Загружается файл...' : 
                 currentFile ? 'Файл успешно загружен' : 
                 isDragOver ? 'Отпустите для загрузки' : 
                 'Выберите файл или перетащите сюда'}
              </p>
              
              {currentFile ? (
                <p className="text-xs text-muted-foreground">
                  {currentFile.split('/').pop()}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Поддерживаемые форматы: PDF, JPG, PNG, DOC, XLS (до {maxSize}MB)
                </p>
              )}
            </div>
            
            {!isUploading && !currentFile && (
              <Button variant="outline" size="sm" className="mt-2">
                <File className="h-4 w-4 mr-2" />
                Обзор файлов
              </Button>
            )}
          </div>
        </div>
        
        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </Card>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
      
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={clearError} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};