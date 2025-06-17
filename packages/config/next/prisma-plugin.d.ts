declare module '@prisma/nextjs-monorepo-workaround-plugin' {
  export class PrismaPlugin {
    constructor(options?: { cwdPath?: string; projectPath?: string; deleteOutputPath?: boolean });
  }
}
