declare module "@prisma/nextjs-monorepo-workaround-plugin" {
  export class PrismaPlugin {
    constructor();
    apply: (compiler: unknown) => void;
  }
}
