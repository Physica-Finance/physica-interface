require('.');

/* eslint-env jest */

test('Object.fromEntries()', () => {
  const myObject = {
    var1: 1,
    var2: 2,
    var3: 3,
  };
  const myObject2 = {
    var1: 1,
    var2: 2,
  };
  const entries = Object.entries(myObject);
  const entries2 = Object.entries(myObject2);

  expect(Object.fromEntries(entries)).toEqual(myObject);
  expect(Object.fromEntries(entries2)).not.toEqual(myObject);
});

test('Object.fromEntries() edge cases', () => {
  expect(Object.fromEntries([])).toEqual({});
  expect(() => { Object.fromEntries(); }).toThrow();
});
