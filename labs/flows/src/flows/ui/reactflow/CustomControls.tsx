import { rem } from '@mantine/core';
import { IconArrowBackUp, IconArrowForwardUp } from '@tabler/icons-react';
import { Controls, ControlButton } from '@xyflow/react';
import { logInfo } from '@repo/observability';

export const CustomControls = () => {
  return (
    <Controls style={{ marginBottom: rem(80) }}>
      <ControlButton
        onClick={() => logInfo('undo')}
        title="undo"
        // disabled={!canUndo}
      >
        <IconArrowBackUp size={20} />
      </ControlButton>
      <ControlButton
        onClick={() => logInfo('redo')}
        title="redo"
        // disabled={!canRedo}
      >
        <IconArrowForwardUp size={20} />
      </ControlButton>
    </Controls>
  );
};
