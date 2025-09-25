import React, { useCallback, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useEventHandler } from '@/components/event-handler';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getWidth } from '@/lib/styles';
import { InvalidIcon } from '@/components/InvalidIcon';
import { Sizes } from '@/types/sizes';
import {
  fileInputVariants,
  uploadIconVariants,
  textVariants,
} from '@/components/ui/input/file-input-variants';

interface FileInput {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  content?: string;
}

interface FileInputWidgetProps {
  id: string;
  value?: FileInput | FileInput[] | null;
  disabled: boolean;
  invalid?: string;
  events: string[];
  width?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  placeholder?: string;
  uploadUrl?: string;
  size?: Sizes;
}

export const FileInputWidget: React.FC<FileInputWidgetProps> = ({
  id,
  value,
  disabled,
  invalid,
  width,
  accept,
  multiple = false,
  maxFiles,
  placeholder,
  uploadUrl,
  size = Sizes.Medium,
}) => {
  const handleEvent = useEventHandler();
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File): Promise<void> => {
      if (!uploadUrl) return;

      // Get the correct host from meta tag or use relative URL
      const getUploadUrl = () => {
        const ivyHostMeta = document.querySelector('meta[name="ivy-host"]');
        if (ivyHostMeta) {
          const host = ivyHostMeta.getAttribute('content');
          return host + uploadUrl;
        }
        // If no meta tag, use relative URL (should work in production)
        return uploadUrl;
      };

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(getUploadUrl(), {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
      } catch (error) {
        console.error('File upload error:', error);
      }
    },
    [uploadUrl]
  );

  const convertFileToUploadFile = useCallback(
    async (file: File): Promise<FileInput> => {
      if (!file) {
        throw new Error('File is required');
      }

      if (uploadUrl) {
        await uploadFile(file);
      }

      // Ivy FileInput should only contain metadata, not file content
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified),
        // Don't include content - it's handled by UploadService
      };
    },
    [uploadFile, uploadUrl]
  );

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      // Check max files limit
      if (maxFiles && files.length > maxFiles) {
        // Only take the first maxFiles files
        const limitedFiles = Array.from(files).slice(0, maxFiles);
        const selectedFiles = multiple
          ? await Promise.all(limitedFiles.map(convertFileToUploadFile))
          : await convertFileToUploadFile(limitedFiles[0]);

        handleEvent('OnChange', id, [selectedFiles]);
        return;
      }

      const selectedFiles = multiple
        ? await Promise.all(Array.from(files).map(convertFileToUploadFile))
        : await convertFileToUploadFile(files[0]);

      handleEvent('OnChange', id, [selectedFiles]);
    },
    [id, multiple, handleEvent, convertFileToUploadFile, maxFiles]
  );

  const handleClear = useCallback(() => {
    handleEvent('OnChange', id, [null]);
  }, [id, handleEvent]);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      // Check max files limit
      if (maxFiles && files.length > maxFiles) {
        // Only take the first maxFiles files
        const limitedFiles = files.slice(0, maxFiles);
        const selectedFiles = multiple
          ? await Promise.all(limitedFiles.map(convertFileToUploadFile))
          : await convertFileToUploadFile(limitedFiles[0]);

        handleEvent('OnChange', id, [selectedFiles]);
        return;
      }

      const selectedFiles = multiple
        ? await Promise.all(files.map(convertFileToUploadFile))
        : await convertFileToUploadFile(files[0]);

      handleEvent('OnChange', id, [selectedFiles]);
    },
    [id, multiple, handleEvent, disabled, convertFileToUploadFile, maxFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const displayValue = value
    ? Array.isArray(value)
      ? value.map(f => f.name).join(', ')
      : value.name
    : '';

  return (
    <div
      className="relative"
      style={{ ...getWidth(width) }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Invalid icon in top right corner, above input */}
      {invalid && (
        <div className="absolute top-2 right-2 z-20 pointer-events-none">
          <InvalidIcon message={invalid} />
        </div>
      )}
      <div
        className={cn(
          fileInputVariants({ size }),
          isDragging && !disabled
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
        onClick={handleClick}
      >
        <Input
          ref={inputRef}
          type="file"
          id={id}
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Upload className={uploadIconVariants({ size })} />
          <p className={textVariants({ size })}>
            {displayValue ||
              placeholder ||
              `Drag and drop your ${multiple ? 'files' : 'file'} here or click to select`}
          </p>
        </div>
        {value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6 z-10"
            onClick={e => {
              e.stopPropagation();
              handleClear();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
