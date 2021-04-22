import { required } from './Form';

test('When required is called with empty string, an error should be returned', () => {
  // call required passing in an empty string
  const result = required('');
  // check that an error is returned
  expect(result).toBe('This must be populated');
});

test('When required is called with a value, an empty string should be returned', () => {
  const result = required('test');
  expect(result).toBe('');
});
