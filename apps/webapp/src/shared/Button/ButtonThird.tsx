import React from 'react';
import { Button, type ButtonProps } from './Button';

const ButtonThird: React.FC<ButtonProps> = ({ color: _color, outline: _outline, ...props }) => {
  return <Button {...props} plain />;
};

export default ButtonThird;
