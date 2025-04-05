declare module "@prisma/client" {
  namespace Prisma {
    interface ProductWhereInput {
      category?: { slug: { in: string[] } } | any;
      fullMarkdown?: { search: string } | any;
      name?: { search: string } | any;
      OR?: ProductWhereInput[];
      previewCopy?: { search: string } | any;
      sellerRelationships?: { some: { isAvailable: boolean } } | any;
    }

    function raw(query: string): any;
  }
}
