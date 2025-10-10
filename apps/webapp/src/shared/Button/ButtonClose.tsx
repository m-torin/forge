import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import ButtonCircle, { ButtonCircleProps } from './ButtonCircle';

const ButtonClose = ({ iconSize = 20, ...props }: ButtonCircleProps & { iconSize?: number }) => {
  return (
    <ButtonCircle {...props}>
      <span className="sr-only">close</span>
      <HugeiconsIcon icon={Cancel01Icon} size={iconSize} color="currentColor" strokeWidth={1.5} />
    </ButtonCircle>
  );
};

export default ButtonClose;
