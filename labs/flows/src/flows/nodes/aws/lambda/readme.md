I'll analyze all AWS Lambda SDK actions and categorize them into our four groups.

1. CORE (Function Lifecycle & Basic Management):

```typescript
// core.ts
-CreateFunction -
  UpdateFunctionCode -
  UpdateFunctionConfiguration -
  DeleteFunction -
  GetFunction -
  ListFunctions -
  InvokeFunction -
  InvokeAsync -
  GetFunctionConfiguration -
  GetAccountSettings -
  ListTags -
  TagResource -
  UntagResource;
```

2. CONFIG (Runtime, Resources & Performance):

```typescript
// config.ts
-PutFunctionConcurrency -
  GetFunctionConcurrency -
  DeleteFunctionConcurrency -
  GetRuntimeManagementConfig -
  PutRuntimeManagementConfig -
  UpdateRuntimeManagementConfig -
  CreateCodeSigningConfig -
  UpdateCodeSigningConfig -
  DeleteCodeSigningConfig -
  GetFunctionCodeSigningConfig -
  PutFunctionCodeSigningConfig -
  DeleteFunctionCodeSigningConfig -
  ListCodeSigningConfigs -
  GetLayerVersion -
  GetLayerVersionByArn -
  PublishLayerVersion -
  DeleteLayerVersion -
  ListLayers -
  ListLayerVersions -
  AddLayerVersionPermission -
  RemoveLayerVersionPermission -
  GetLayerVersionPolicy -
  PutProvisionedConcurrencyConfig -
  GetProvisionedConcurrencyConfig -
  DeleteProvisionedConcurrencyConfig -
  ListProvisionedConcurrencyConfigs;
```

3. VERSIONS (Versioning, Access & URLs):

```typescript
// versions.ts
-PublishVersion -
  ListVersionsByFunction -
  CreateAlias -
  UpdateAlias -
  DeleteAlias -
  GetAlias -
  ListAliases -
  CreateFunctionUrlConfig -
  UpdateFunctionUrlConfig -
  DeleteFunctionUrlConfig -
  GetFunctionUrlConfig -
  ListFunctionUrlConfigs -
  AddPermission -
  RemovePermission -
  GetPolicy;
```

4. EVENTS (Event Sources & Integration):

```typescript
// events.ts
-CreateEventSourceMapping -
  UpdateEventSourceMapping -
  DeleteEventSourceMapping -
  GetEventSourceMapping -
  ListEventSourceMappings -
  PutFunctionEventInvokeConfig -
  GetFunctionEventInvokeConfig -
  ListFunctionEventInvokeConfigs -
  DeleteFunctionEventInvokeConfig;
```

Key Observations:

1. Core: Basic CRUD and immediate function operations
2. Config: All settings, layers, and performance configurations
3. Versions: All versioning, URLs, and access control
4. Events: Everything related to triggers and event handling
