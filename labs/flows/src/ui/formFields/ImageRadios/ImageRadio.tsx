// ImageRadio.tsx
'use client';

import React, { memo, useCallback } from 'react';
import { Box, Text, Radio, rem } from '@mantine/core';
import { motion } from 'framer-motion';
import classes from './ImageRadios.module.scss';
import { RadioItem } from './types';
import { IconProps } from '@tabler/icons-react';

interface ImageRadioProps {
  item: RadioItem;
  isChecked: boolean;
  setValue: (value: string) => void;
  form: {
    setFieldValue: (field: string, value: any) => void;
    validateField: (field: string) => void;
  } | null;
  disabled: boolean;
  iconComponent?: React.ComponentType<IconProps>;
}

const ImageRadio: React.FC<ImageRadioProps> = ({
  item,
  isChecked,
  setValue,
  form,
  disabled,
  iconComponent: Icon = item.icon, // Use the updated type
}) => {
  const handleInteraction = useCallback(
    (value: string) => {
      if (!disabled) {
        setValue(value);
        form?.setFieldValue('flowMethod', value as any);
        form?.validateField('flowMethod');
      }
    },
    [disabled, setValue, form],
  );

  return (
    <motion.div
      animate={{ scale: isChecked ? 1.05 : 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={() => handleInteraction(item.value)}
    >
      <Box>
        <Box
          mb={rem(5)}
          className={`${classes.radioBox} ${isChecked ? 'data-checked' : ''}`}
          data-checked={isChecked ? 'true' : undefined}
          tabIndex={0}
          role="radio"
          aria-checked={isChecked}
          aria-disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleInteraction(item.value);
            }
          }}
          style={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            outline: 'none',
          }}
        >
          <Icon
            style={{ width: rem(40), height: rem(40) }}
            stroke={1.5}
            color={`var(--mantine-color-cyan-${isChecked ? '6' : '4'})`}
          />
          <Box mr={rem(15)}>
            <Text>{item.label}</Text>
          </Box>
          <Radio value={item.value} checked={isChecked} readOnly color="cyan" />
        </Box>
        <Text
          size="sm"
          className={classes.helperText}
          data-checked={isChecked ? 'true' : 'false'}
        >
          {item.helperText}
        </Text>
      </Box>
    </motion.div>
  );
};

export default memo(ImageRadio);
