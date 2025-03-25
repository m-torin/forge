declare module '@prisma/nextjs-monorepo-workaround-plugin' {
  export class PrismaPlugin {
    apply: (compiler: any) => void;
  }
}
