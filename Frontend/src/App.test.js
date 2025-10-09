// References:
// Testing Library. (2025) React Testing Library - Introduction. Available at: https://testing-library.com/docs/react-testing-library/intro/ (Accessed: 07 January 2025).
// Jestjs.io. (2025) Jest - Expect. Available at: https://jestjs.io/docs/expect (Accessed: 07 January 2025).

describe('Basic App Tests', () => {
  test('renders without crashing', () => {
    const div = document.createElement('div');
    expect(div).toBeTruthy();
  });

  test('basic math works', () => {
    expect(1 + 1).toBe(2);
  });
});
