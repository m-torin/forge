'use client';

import React, {
  useCallback,
  useTransition,
  useState,
  useDeferredValue,
  memo,
 Dispatch, SetStateAction, TransitionStartFunction } from 'react';
import cx from 'clsx';
import { Box, rem, SimpleGrid, Text } from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DropResult,
} from '@hello-pangea/dnd';
import { IconGripVertical } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import classes from './DragDropLists.module.scss';


export interface ListItem {
  position: number;
  mass: number;
  symbol: string;
  name: string;
}

export const handleDragStart = (
  setIsDragging: Dispatch<SetStateAction<boolean>>,
): void => {
  setIsDragging(true);
};

export const handleDragEnd = (
  result: DropResult,
  setIsDragging: Dispatch<SetStateAction<boolean>>,
  setList1: Dispatch<SetStateAction<ListItem[]>>,
  setList2: Dispatch<SetStateAction<ListItem[]>>,
  startTransition: TransitionStartFunction,
): void => {
  setIsDragging(false);
  const { destination, source } = result;
  if (!destination) return;

  startTransition(() => {
    if (destination.droppableId === source.droppableId) {
      const updateList =
        destination.droppableId === 'list1' ? setList1 : setList2;
      updateList((current) => {
        const updatedList = [...current];
        const [movedItem] = updatedList.splice(source.index, 1);
        updatedList.splice(destination.index, 0, movedItem);
        return updatedList;
      });
    } else {
      const sourceUpdate = source.droppableId === 'list1' ? setList1 : setList2;
      const destUpdate =
        destination.droppableId === 'list1' ? setList1 : setList2;

      sourceUpdate((currentSource) => {
        const sourceClone = [...currentSource];
        const [movedItem] = sourceClone.splice(source.index, 1);
        destUpdate((currentDest) => {
          const destClone = [...currentDest];
          destClone.splice(destination.index, 0, movedItem);
          return destClone;
        });
        return sourceClone;
      });
    }
  });
};

const DraggableItem = memo(
  ({
    item,
    index,
    listId,
  }: {
    item: ListItem;
    index: number;
    listId: string;
  }) => (
    <Draggable
      key={item.symbol}
      index={index}
      draggableId={`${listId}-${item.symbol}`}
    >
      {(provided: DraggableProvided, snapshot: { isDragging: any }) => (
        <motion.div
          className={cx(classes.item, {
            [classes.itemDragging]: snapshot.isDragging,
          })}
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            transition: snapshot.isDragging ? 'none' : 'transform 0.2s ease',
          }}
        >
          <div {...provided.dragHandleProps} className={classes.dragHandle}>
            <IconGripVertical
              style={{ width: rem(18), height: rem(18) }}
              stroke={1.5}
            />
          </div>
          <Text className={classes.symbol}>{item.symbol}</Text>
          <div>
            <Text>{item.name}</Text>
            <Text c="dimmed" size="sm">
              Position: {item.position} • Mass: {item.mass}
            </Text>
          </div>
        </motion.div>
      )}
    </Draggable>
  ),
);

const DroppableList = memo(
  ({ items, listId }: { items: ListItem[]; listId: string }) => (
    <Droppable droppableId={listId} direction="vertical">
      {(provided: DroppableProvided, snapshot: { isDraggingOver: any }) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={cx(classes.list, {
            [classes.listHighlight]: snapshot.isDraggingOver,
          })}
        >
          {items &&
            items.map(
              (item, index) =>
                item && (
                  <DraggableItem
                    key={item.symbol}
                    item={item}
                    index={index}
                    listId={listId}
                  />
                ),
            )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  ),
);

interface DragDropListsProps {
  initialList1: ListItem[];
  initialList2: ListItem[];
}

export const DragDropLists = ({
  initialList1,
  initialList2,
}: DragDropListsProps) => {
  const [list1, setList1] = useDebouncedState<ListItem[]>(initialList1, 300);
  const [list2, setList2] = useDebouncedState<ListItem[]>(initialList2, 300);
  const deferredList1 = useDeferredValue(list1);
  const deferredList2 = useDeferredValue(list2);
  const [_isPending, startTransition] = useTransition();
  const [_isDragging, setIsDragging] = useState(false);

  const onDragStart = useCallback(() => handleDragStart(setIsDragging), []);

  const onDragEnd = useCallback(
    (result: DropResult) =>
      handleDragEnd(result, setIsDragging, setList1, setList2, startTransition),
    [startTransition, setList1, setList2],
  );

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <SimpleGrid cols={2}>
        <motion.div
          whileInView={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Box>
            <Text mb="md" ta="center">
              Run These
            </Text>
            <DroppableList items={deferredList1} listId="list1" />
          </Box>
        </motion.div>
        <motion.div
          whileInView={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Box>
            <Text mb="md" ta="center">
              Not These
            </Text>
            <DroppableList items={deferredList2} listId="list2" />
          </Box>
        </motion.div>
      </SimpleGrid>
    </DragDropContext>
  );
};
