import React, { Suspense } from 'react';
import { WidgetNode } from '@/types/widgets';
import { widgetMap } from '@/widgets/widgetMap';

const isLazyComponent = (
  component:
    | React.ComponentType<Record<string, unknown>>
    | React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>
): boolean => {
  return (
    component &&
    (component as { $$typeof?: symbol }).$$typeof === Symbol.for('react.lazy')
  );
};

const isChartComponent = (nodeType: string): boolean => {
  return nodeType.startsWith('Ivy.') && nodeType.includes('Chart');
};

const flattenChildren = (children: WidgetNode[]): WidgetNode[] => {
  return children.flatMap(child => {
    if (child.type === 'Ivy.Fragment') {
      return flattenChildren(child.children || []);
    }
    return [child];
  });
};

//

export const renderWidgetTree = (node: WidgetNode): React.ReactNode => {
  const Component = widgetMap[
    node.type as keyof typeof widgetMap
  ] as React.ComponentType<Record<string, unknown>>;

  if (!Component) {
    return <div>{`Unknown component type: ${node.type}`}</div>;
  }

  const props: Record<string, unknown> = {
    ...node.props,
    id: node.id,
    events: node.events,
  };

  if ('testId' in props && props.testId) {
    props['data-testid'] = props.testId;
    delete props.testId;
  }

  const children = flattenChildren(node.children || []);

  // Process children, grouping by Slot widgets (original behavior)
  const slots = children.reduce(
    (acc, child) => {
      if (child.type === 'Ivy.Slot') {
        const slotName = child.props.name as string;
        acc[slotName] = (child.children || []).map(slotChild =>
          renderWidgetTree(slotChild)
        );
      } else {
        acc.default = acc.default || [];
        acc.default.push(renderWidgetTree(child));
      }
      return acc;
    },
    {} as Record<string, React.ReactNode[]>
  );

  const content = (
    <Component {...props} slots={slots} key={node.id}>
      {slots.default}
    </Component>
  );

  // For chart components, provide a specific fallback
  if (isLazyComponent(Component) && isChartComponent(node.type)) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading chart...</span>
          </div>
        }
        key={node.id}
      >
        {content}
      </Suspense>
    );
  }

  // For other lazy components, use original behavior
  return isLazyComponent(Component) ? (
    <Suspense key={node.id}>{content}</Suspense>
  ) : (
    content
  );
};

export const loadingState = (): WidgetNode => ({
  type: '$loading',
  id: 'loading',
  props: {},
  events: [],
});
