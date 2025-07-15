declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

interface MonacoWindow extends Window {
  MonacoEnvironment?: {
    getWorkerUrl?: (moduleId: string, label: string) => string;
  };
}

declare const self: MonacoWindow;
