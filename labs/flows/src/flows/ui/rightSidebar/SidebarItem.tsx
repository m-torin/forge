import React, { useMemo, DragEvent, useCallback } from 'react';
import { Accordion, Notification, rem } from '@mantine/core';
import { useIntersection } from '@mantine/hooks';
import classes from './FlowAside.module.scss';
import { motion, useAnimation } from 'framer-motion';
import { IconProps } from '@tabler/icons-react';
import { useAppContext } from '#/app/flow/[cuid]/FlowProvider';
import { GroupData } from '#/flows/nodes';
import { logInfo } from '@repo/observability';

interface SidebarItemProps {
  group: GroupData;
  filterText: string;
  disabled?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  group,
  filterText,
  disabled,
}) => {
  const { setDnDType } = useAppContext();

  const filteredItems = useMemo(
    () =>
      group.items.filter((item) =>
        item.label.toLowerCase().includes(filterText.toLowerCase()),
      ),
    [group.items, filterText],
  );

  const renderIcon = useCallback(
    (icon: React.ReactNode | undefined) => {
      if (icon && React.isValidElement<IconProps>(icon)) {
        const IconComponent = icon.type as React.ComponentType<IconProps>;
        return (
          <IconComponent color={`var(--mantine-color-${group.color}-7)`} />
        );
      }
      return null;
    },
    [group.color],
  );

  const onDragStart = useCallback(
    (event: DragEvent, nodeType: string) => {
      logInfo(`Dragging node type: ${nodeType}`, { nodeType });
      setDnDType(nodeType);
      event.dataTransfer.effectAllowed = 'move';
    },
    [setDnDType],
  );

  return (
    <Accordion.Item
      value={group.label.toLowerCase().replace(/\s+/g, '')}
      className={`${classes.item} ${disabled ? classes.disabled : ''}`}
    >
      <Accordion.Control
        icon={renderIcon(group.icon as React.ReactNode)}
        className={classes.control}
      >
        {group.label}
      </Accordion.Control>

      <Accordion.Panel>
        {filteredItems.map((item, index) => (
          <ItemWithIntersection
            key={`${item.label || `item-${index}`}`}
            item={item}
            groupColor={group.color}
            onDragStart={onDragStart}
          />
        ))}
      </Accordion.Panel>
    </Accordion.Item>
  );
};

// Separate component for intersection observation
const ItemWithIntersection = React.memo(
  ({
    item,
    groupColor,
    onDragStart,
  }: {
    item: GroupData['items'][0];
    groupColor: string;
    onDragStart: (event: DragEvent, nodeType: string) => void;
  }) => {
    const { ref, entry } = useIntersection({
      root: null,
      rootMargin: '60px 0px 0px 0px',
      threshold: Array.from({ length: 101 }, (_, i) => i / 100),
    });

    const controls = useAnimation();
    const intersectionRatio = entry?.intersectionRatio || 0;

    React.useEffect(() => {
      controls.start({
        scale: intersectionRatio * 0.3 + 0.7,
        opacity: intersectionRatio * 0.7 + 0.3,
        transition: { duration: 0.2, ease: 'easeOut' },
      });
    }, [intersectionRatio, controls]);

    return (
      <div style={{ cursor: 'pointer' }}>
        <motion.div
          ref={ref}
          initial={{ scale: 0.7, opacity: 0.3 }}
          animate={controls}
        >
          <Notification
            withCloseButton={false}
            withBorder
            color={groupColor}
            title={item.label}
            onDragStart={(event: DragEvent) =>
              onDragStart(event, item.onDragStartType || 'default')
            }
            draggable
            className={intersectionRatio < 0.5 ? classes.shrink : ''}
            py={rem(8)}
          />
        </motion.div>
      </div>
    );
  },
);

ItemWithIntersection.displayName = 'ItemWithIntersection';

export default React.memo(SidebarItem);
