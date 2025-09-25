import { getHeight, getWidth } from '@/lib/styles';
import { getIvyHost } from '@/lib/utils';
import React from 'react';

interface ImageWidgetProps {
  id: string;
  src: string | undefined | null;
  width?: string;
  height?: string;
}

const getImageUrl = (url: string | undefined | null) => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  return `${getIvyHost()}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const ImageWidget: React.FC<ImageWidgetProps> = ({
  id,
  src,
  width,
  height,
}) => {
  const styles: React.CSSProperties = {
    ...getWidth(width),
    ...getHeight(height),
  };
  if (!src) return '';
  return <img src={getImageUrl(src)} key={id} style={styles} />;
};
