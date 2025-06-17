import type { UserConfig } from 'vitest/config';

export declare const reactPreset: UserConfig;
export declare const nodePreset: UserConfig;
export declare const nextPreset: UserConfig;
export declare const databasePreset: UserConfig;
export declare const integrationPreset: UserConfig;

export declare function createPreset(overrides?: UserConfig): UserConfig;

export default reactPreset;
