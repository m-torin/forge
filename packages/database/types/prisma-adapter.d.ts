declare module "@prisma/adapter-neon" {
  import { type Pool } from "@neondatabase/serverless";

  export class PrismaNeon {
    constructor(pool: Pool);
  }
}

declare module "@prisma/client" {
  namespace Prisma {
    interface PrismaClientOptions {
      adapter?: any;
    }
  }
}
