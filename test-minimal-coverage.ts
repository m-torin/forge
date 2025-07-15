// Minimal test file to check coverage behavior
export function testFunction() {
  return true;
}

// This function is not tested, should result in low coverage
export function untestedFunction() {
  const a = 1;
  const b = 2;
  const c = 3;
  const d = 4;
  const e = 5;
  return a + b + c + d + e;
}
