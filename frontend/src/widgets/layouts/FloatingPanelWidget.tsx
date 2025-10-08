import { Align, getMargin } from '@/lib/styles';
import React from 'react';
import { createPortal } from 'react-dom';

interface FloatingPanelWidgetProps {
  id: string;
  align: Align;
  offset: string;
  children: React.ReactNode;
}

export const FloatingPanelWidget = ({
  id,
  align,
  offset,
  children,
}: FloatingPanelWidgetProps) => {
  const styles = {
    ...getMargin(offset),
  };

  const positionClasses: { [key in Align]: string } = {
    TopLeft: 'top-4 left-4',
    TopRight: 'top-4 right-4',
    BottomLeft: 'bottom-4 left-4',
    BottomRight: 'bottom-4 right-4',
    TopCenter: 'top-4 left-1/2 -translate-x-1/2',
    BottomCenter: 'bottom-4 left-1/2 -translate-x-1/2',
    Left: 'top-1/2 left-4 -translate-y-1/2',
    Right: 'top-1/2 right-4 -translate-y-1/2',
    Center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    Stretch: '',
  };

  // If a tab header actions slot exists, prefer rendering into it for left-aligned FABs.
  if (
    (align === 'TopLeft' || align === 'BottomLeft') &&
    typeof document !== 'undefined'
  ) {
    const headerSlot = document.querySelector(
      '[data-ivy-tab-header-actions]'
    ) as HTMLElement | null;
    if (headerSlot) {
      return createPortal(
        <div key={id} className="inline-flex">
          {children}
        </div>,
        headerSlot
      );
    }
  }
  return (
    <div
      className={`fixed ${positionClasses[align]} z-50`}
      style={styles}
      key={id}
    >
      {children}
    </div>
  );
};
