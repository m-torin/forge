'use client';

import { DragDropLists } from '#/ui/formFields';
import {
  Button,
  Text,
  Paper,
  ScrollArea,
  rem,
  Box,
  SimpleGrid,
  Textarea,
  TagsInput,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowRight, IconSignature } from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface ListItem {
  position: number;
  mass: number;
  symbol: string;
  name: string;
}

const initialList1: ListItem[] = [
  { position: 6, mass: 12.011, symbol: 'Mc', name: 'Mission Control' },
  { position: 7, mass: 14.007, symbol: 'PV', name: 'PV' },
];

const initialList2: ListItem[] = [
  { position: 39, mass: 88.906, symbol: 'HDI', name: 'HDI' },
  { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
  { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
];

const TestValidateBlock = ({
  onFocus,
  onBlur,
}: {
  onFocus: (event: any) => void;
  onBlur: (event: any) => void;
}) => (
  <motion.div
    transition={{ delay: 0.2 }}
    whileInView={{ opacity: 1 }}
    initial={{ opacity: 0 }}
  >
    <Paper mb={rem(35)} bg="gray.0" withBorder py={rem(15)} px={rem(20)}>
      <SimpleGrid cols={2}>
        <Box>
          <motion.div onFocus={onFocus} onBlur={onBlur}>
            <TextInput
              leftSectionPointerEvents="none"
              leftSection={
                <IconSignature style={{ width: rem(16), height: rem(16) }} />
              }
              label="Test Case"
              placeholder="Name your test case"
              mb={rem(15)}
            />
          </motion.div>
          <TagsInput
            label="Tags"
            placeholder="Enter tag"
            defaultValue={['first', 'second']}
          />
        </Box>
        <Box>
          <motion.div onFocus={onFocus} onBlur={onBlur}>
            <Textarea
              resize="vertical"
              autosize
              label="JSON Payload"
              placeholder="{}"
              description="This test case uses JSON as a trigger."
            />
          </motion.div>
        </Box>
      </SimpleGrid>
    </Paper>
  </motion.div>
);

const DragDropListsBlock = ({
  onDragStart,
  onDrag,
  onDragEnd,
}: {
  onDragStart: (event: any) => void;
  onDrag: (event: any) => void;
  onDragEnd: (event: any) => void;
}) => (
  <motion.div onDragStart={onDragStart} onDrag={onDrag} onDragEnd={onDragEnd}>
    <Box mb={rem(35)}>
      <DragDropLists initialList1={initialList1} initialList2={initialList2} />
    </Box>
  </motion.div>
);

const SimulateRunButton = ({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) => (
  <Box>
    <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
      <Button
        variant="light"
        color="teal"
        loading={loading}
        loaderProps={{ type: 'dots' }}
        onClick={onClick}
        rightSection={<IconArrowRight size={14} />}
      >
        Simulate Run
      </Button>
    </motion.div>
  </Box>
);

const RuntimeLogsSection = () => (
  <>
    <Text mb="md" ta="center">
      Runtime Logs
    </Text>
    <Box />
  </>
);

const ScrollAreaBlock = () => (
  <motion.div whileInView={{ opacity: 1 }} initial={{ opacity: 0 }}>
    <Paper withBorder p="xl" mb={rem(50)} bg="gray.0">
      <ScrollArea h={250} offsetScrollbars>
        ~~~
      </ScrollArea>
    </Paper>
  </motion.div>
);

export function FlowValidation() {
  const [loading, { toggle }] = useDisclosure();

  return (
    <ScrollArea w={400} h="calc(100vh - 220px)" type="auto" offsetScrollbars>
        <Box miw={800}>
          <TestValidateBlock onFocus={() => {}} onBlur={() => {}} />
          <DragDropListsBlock
            onDragStart={() => {}}
            onDrag={() => {}}
            onDragEnd={() => {}}
          />

          <motion.div
            whileInView={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ delay: 0.8 }}
          >
            <SimpleGrid cols={3}>
              <SimulateRunButton loading={loading} onClick={toggle} />
              <RuntimeLogsSection />
            </SimpleGrid>
          </motion.div>

          <ScrollAreaBlock />
        </Box>
      </ScrollArea>
  );
}
