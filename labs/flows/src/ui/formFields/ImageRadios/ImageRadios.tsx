'use client';

import React, { useCallback } from 'react';
import { Radio, Group } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { UseFormReturnType } from '@mantine/form';
import { motion } from 'framer-motion';
import ImageRadio from './ImageRadio';
import { logInfo } from '@repo/observability';
import { RadioItem } from './types';

export interface ImageRadiosProps {
  items?: RadioItem[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  form: UseFormReturnType<any>;
  disabled?: boolean;
}

export const ImageRadios = ({
  items = [],
  defaultValue,
  onChange,
  form,
  disabled = false,
}: ImageRadiosProps) => {
  const [value, setValue] = useUncontrolled({
    value: form?.getValues().flowMethod,
    defaultValue: defaultValue ?? '',
    finalValue: '',
    onChange: onChange || (() => {}),
  });

  if (!form) {
    throw new Error('ImageRadios requires a form prop but got undefined.');
  }

  const handleChange = useCallback(
    (value: string) => {
      logInfo(`Radio.Group onChange called with value: ${value}`, { value });
      setValue(value);
      form.setFieldValue('flowMethod', value as any);
      form.validateField('flowMethod');
    },
    [setValue, form],
  );

  const radioVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Radio.Group
      name="flowMethod"
      label="Which method do you prefer?"
      description="You can change this later, don't worry!"
      withAsterisk
      tabIndex={1}
      value={value}
      error={form.errors.flowMethod}
      onChange={handleChange}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <Group mt="xs" gap="md">
          {items.map((item) => (
            <motion.div key={item.value} variants={radioVariants}>
              <ImageRadio
                item={item}
                isChecked={value === item.value}
                setValue={setValue}
                form={form}
                disabled={disabled}
                iconComponent={item.icon}
              />
            </motion.div>
          ))}
          {/* Uncomment and adjust the Button if needed */}
          {/* <Button
            mb={rem(20)}
            leftSection={<IconHelp size={20} />}
            variant="subtle"
            color="blue"
            disabled={true || disabled}
          >
            Guide me
          </Button> */}
        </Group>
      </motion.div>
    </Radio.Group>
  );
};
