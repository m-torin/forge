import React from 'react';
import { Button, type ButtonProps } from './Button';

const ButtonSecondary: React.FC<ButtonProps> = ({ color: _color, plain: _plain, ...props }) => {
  return <Button {...props} outline />;
};

export default ButtonSecondary;
