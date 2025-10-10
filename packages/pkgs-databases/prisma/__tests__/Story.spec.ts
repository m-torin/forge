import { describe, expect, it } from 'vitest';
import { create, updateBySlug } from '../src/orm/ecommerce/Story';

describe('Story helpers omit forwarding', () => {
  it('forwards omit in full create args', async () => {
    const last: any = {};
    const fakeDelegate = {
      create: async (args: any) => {
        last.args = args;
        return { id: '1', ...args.data };
      },
    } as any;
    const fakePrisma = { story: fakeDelegate } as any;
    const fullArgs = { data: { name: 'Full' }, omit: { secret: true } };
    const res = await create(fakePrisma, fullArgs as any);
    expect(last.args).toEqual(fullArgs);
    expect(res.id).toBe('1');
  });

  it('forwards omit in shorthand create', async () => {
    const last: any = {};
    const fakeDelegate = {
      create: async (args: any) => {
        last.args = args;
        return { id: '2', ...args.data };
      },
    } as any;
    const fakePrisma = { story: fakeDelegate } as any;
    const data = { name: 'Short' };
    const opts = { omit: { secret: true }, include: { series: true } };
    const res = await create(fakePrisma, data as any, opts as any);
    expect(last.args.data).toEqual(data);
    expect(last.args.omit).toEqual(opts.omit);
    expect(last.args.include).toEqual(opts.include);
    expect(res.id).toBe('2');
  });

  it('updateBySlug finds id and forwards omit to update', async () => {
    const last: any = {};
    const fakeDelegate = {
      findFirst: async (args: any) => {
        last.findFirstArgs = args;
        if (args.where && args.where.slug && args.where.slug.equals === 'my-slug')
          return { id: 'found-id' };
        return null;
      },
      update: async (args: any) => {
        last.updateArgs = args;
        return { id: args.where.id, ...args.data };
      },
    } as any;
    const fakePrisma = { story: fakeDelegate } as any;
    const res = await updateBySlug(fakePrisma, 'my-slug', { title: 't' }, {
      omit: { secret: 'x' },
    } as any);
    expect(last.findFirstArgs).toBeTruthy();
    expect(last.updateArgs.where.id).toEqual('found-id');
    expect(last.updateArgs.omit).toEqual({ secret: 'x' });
    expect(res.id).toEqual('found-id');
  });
});
