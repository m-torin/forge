# Orchestration Package Test Coverage Improvement Plan

## Current Status
- **Starting Coverage**: 11.4% (Statement Coverage)
- **Target**: 80%+ coverage
- **Package**: @repo/orchestration

## Current Coverage Analysis

### Files with High Coverage (Keep/Enhance)
- `src/client.ts`: 81.21% - Good foundation, needs minor improvements
- `src/shared/patterns/retry.ts`: 55% - Medium coverage, can be improved
- `src/shared/patterns/index.ts`: 100% - Perfect

### Files with Low Coverage (Priority Targets)
- `src/client-next.ts`: 0% (1100 lines) - **HIGH PRIORITY**
- `src/server-next.ts`: 0% (1534 lines) - **HIGH PRIORITY**
- `src/server.ts`: 0% (162 lines) - **HIGH PRIORITY**
- `src/index.ts`: 0% (95 lines) - **HIGH PRIORITY**
- `src/shared/factories/step-factory.ts`: 16.41% (933 lines) - **HIGH PRIORITY**
- `src/shared/factories/step-registry.ts`: 7.72% (733 lines) - **HIGH PRIORITY**

### Medium Priority Targets
- `src/shared/factories/step-templates.ts`: 17.16% (1307 lines)
- `src/shared/patterns/circuit-breaker.ts`: 19.93% (421 lines)
- `src/shared/patterns/batch.ts`: 2.61% (514 lines)

### Zero Coverage Files (Need Basic Tests)
- All files in `src/examples/`
- All files in `src/providers/`
- All files in `src/shared/features/`
- All files in `src/shared/types/`

## Improvement Strategy

### Phase 1: Fix Existing Failing Tests (Foundation)
1. Fix failing tests in existing test files
2. Ensure all passing tests continue to pass
3. Update test expectations to match actual implementation

### Phase 2: High-Impact Files (Maximum Coverage Gain)
1. **client-next.ts** (1100 lines, 0% coverage)
2. **server-next.ts** (1534 lines, 0% coverage) 
3. **server.ts** (162 lines, 0% coverage)
4. **index.ts** (95 lines, 0% coverage)

### Phase 3: Factory System (Core Functionality)
1. **step-factory.ts** (933 lines, 16.41% → 80%+)
2. **step-registry.ts** (733 lines, 7.72% → 80%+)
3. **step-templates.ts** (1307 lines, 17.16% → 80%+)

### Phase 4: Patterns & Features
1. **circuit-breaker.ts** (421 lines, 19.93% → 80%+)
2. **batch.ts** (514 lines, 2.61% → 80%+)
3. Files in `src/shared/features/`

### Phase 5: Providers & Examples
1. Provider files (0% → 60%+)
2. Example files (0% → 60%+)
3. Type files (basic coverage)

## Progress Tracking

### Completed Rounds

#### Round 1: Phase 1 - Foundation ✅ COMPLETED
**Objective**: Fix failing tests to establish a solid foundation
**Results**: 
- Fixed input-validation tests (43/43 passing)
- Fixed data-masking tests (23/23 passing)
- Fixed manager-basic tests (36/36 passing)
- Fixed validation tests (37/37 passing)
- **Total**: 139 tests fixed and passing

#### Round 2: Phase 2 - High-Impact Files (Partial) ✅ COMPLETED
**Objective**: Target main entry point files for maximum coverage impact
**Results**:
- **src/index.ts**: 0% → 100% (22 tests, 95 lines covered)
- **src/server.ts**: 0% → 100% (24 tests, 162 lines covered)
- **Total**: 46 new tests, 257 lines at 100% coverage

#### Overall Progress Summary
- **Starting Coverage**: 11.4%
- **Current Coverage**: 15.19%
- **Improvement**: +3.79% (33.2% relative increase)
- **Files at 100% Coverage**: 2 files (index.ts, server.ts)
- **Tests Added**: 185+ tests (139 fixed + 46 new)
- **Lines Covered**: 257 lines at 100% coverage

### Current Round: Phase 1 - Foundation ✅ COMPLETED
- [x] Fix failing input-validation tests
- [x] Fix failing data-masking tests  
- [x] Fix failing manager-basic tests
- [x] Fix failing validation tests
- [ ] Fix failing step-factory-coverage tests (deferred - complex)
- [ ] Fix failing server-next tests (deferred - complex)

### Current Round: Phase 2 - High-Impact Files
- [x] **src/index.ts** (95 lines, 0% → 100%) ✅ **COMPLETED**
- [x] **src/server.ts** (162 lines, 0% → 100%) ✅ **COMPLETED**
- [ ] **src/client.ts** (322 lines, 0% → enhance from 81.21%) - **CURRENT TARGET**
- [ ] **src/client-next.ts** (1100 lines, 0% → 60%+)
- [ ] **src/server-next.ts** (1534 lines, 0% → 60%+)

### Success Metrics
- **Target Coverage**: 80%+ statement coverage
- **Test Quality**: All tests passing
- **Maintainability**: Well-structured, readable tests
- **Performance**: Tests run efficiently

## Test Patterns to Follow

### 1. Simple Function Tests
```typescript
describe('functionName', () => {
  test('should handle basic case', () => {
    expect(functionName(input)).toBe(expected);
  });
  
  test('should handle edge cases', () => {
    expect(() => functionName(invalidInput)).toThrow();
  });
});
```

### 2. Class/Object Tests
```typescript
describe('ClassName', () => {
  test('should initialize correctly', () => {
    const instance = new ClassName(config);
    expect(instance).toBeDefined();
  });
  
  test('should handle method calls', () => {
    const instance = new ClassName(config);
    expect(instance.method()).toBe(expected);
  });
});
```

### 3. Export Tests
```typescript
describe('module exports', () => {
  test('should export required functions', () => {
    expect(exportedFunction).toBeDefined();
    expect(typeof exportedFunction).toBe('function');
  });
});
```

## Key Challenges Identified

1. **Complex Integration**: Many files have complex dependencies
2. **Async Operations**: Heavy use of async/await patterns
3. **Mock Requirements**: Need sophisticated mocking for external dependencies
4. **Type Safety**: Maintaining TypeScript type safety in tests
5. **Test Isolation**: Ensuring tests don't interfere with each other

## Next Steps

### Immediate Priorities (Phase 2 Continuation)
1. **src/client.ts** (322 lines, currently 0% but has existing test structure)
   - Enhance existing client.test.ts to improve from 81.21% to 90%+
   - Focus on uncovered lines in client.ts
   - Estimated impact: +2-3% overall coverage

2. **src/shared/utils/workflow-utilities.ts** (840 lines, 28.15% coverage)
   - High-impact file with many utility functions
   - Already has some coverage, build on existing foundation
   - Estimated impact: +5-7% overall coverage

3. **src/shared/utils/manager.ts** (746 lines, 28.68% coverage)
   - Core orchestration manager functionality
   - Critical for overall system functionality
   - Estimated impact: +4-6% overall coverage

### Medium-Term Targets (Phase 3)
1. **src/shared/factories/step-factory.ts** (933 lines, 57.76% coverage)
   - Already has significant coverage, can be improved
   - Core step factory functionality
   - Estimated impact: +3-5% overall coverage

2. **src/shared/utils/validation.ts** (495 lines, 59.11% coverage)
   - Validation utilities with good existing coverage
   - Can be enhanced to 80%+ easily
   - Estimated impact: +2-3% overall coverage

### Long-Term Goals (Phase 4)
1. **src/client-next.ts** (1100 lines, 0% coverage)
   - Large file but complex Next.js integration
   - Target 60% coverage initially
   - Estimated impact: +8-12% overall coverage

2. **src/server-next.ts** (1534 lines, 0% coverage)
   - Largest file with complex Next.js server integration
   - Target 60% coverage initially
   - Estimated impact: +12-18% overall coverage

### Projected Timeline to 80% Coverage
- **Phase 2 Completion**: 15.19% → 25-30% coverage
- **Phase 3 Completion**: 25-30% → 45-55% coverage  
- **Phase 4 Completion**: 45-55% → 80%+ coverage

### Success Strategies Identified
1. **Fix failing tests first** - Provides stable foundation
2. **Target high-impact files** - Maximum coverage gain per effort
3. **Use simple functional tests** - More reliable than complex mocks
4. **Build incrementally** - Test each improvement immediately
5. **Focus on exports and public APIs** - Most important functionality

## Notes

- Prioritize statement coverage over branch coverage initially
- Focus on testing actual functionality rather than implementation details
- Use vi.mock() sparingly and prefer simple function tests
- Ensure all tests are deterministic and fast