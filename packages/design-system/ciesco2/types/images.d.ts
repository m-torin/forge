declare module '*.png' {
  import { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}

declare module '*.jpg' {
  import { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}

declare module '*.jpeg' {
  import { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.ico' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  import { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}