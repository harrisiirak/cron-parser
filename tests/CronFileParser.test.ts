import fs from 'fs';
import fsPromises from 'fs/promises';
import { CronFileParser } from '../src/CronFileParser';
import { CronDate } from '../src/CronDate';

jest.mock('fs/promises');
jest.mock('fs');

const mockInvalidFileContent = `
  FOO=bar
  */5 * * * * valid-command
  invalid expression here
  * * * * * another-valid
`;

const mockCrontabExampleContent = `
  # Comment line (ignore)
  ENV1="test1"
  ENV2="test2"

  */10 * * * * /path/to/exe
  */10 * * * * /path/to/exe
  0 09-18 * * 1-5 /path/to/exe
`;

describe('CronFileParser', () => {
  beforeEach(() => {
    // Mock fs/promises
    (fsPromises.readFile as jest.Mock).mockImplementation((path: string) => {
      if (path === 'tests/crontab.example') {
        return Promise.resolve(mockCrontabExampleContent);
      }
      return Promise.reject(new Error('File not found'));
    });

    // Mock fs
    (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path === 'tests/crontab.example') {
        return mockCrontabExampleContent;
      }
      if (path === './temp-invalid.txt') {
        return mockInvalidFileContent;
      }
      throw new Error('File not found');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseFile', () => {
    test('reads and parses a valid crontab file', async () => {
      const result = await CronFileParser.parseFile('tests/crontab.example');

      expect(Object.keys(result.variables)).toHaveLength(2);
      expect(Object.keys(result.errors)).toHaveLength(0);
      expect(result.expressions).toHaveLength(3);
      expect(fsPromises.readFile).toHaveBeenCalledWith('tests/crontab.example', 'utf8');

      // Verify expressions are valid
      for (const expr of result.expressions) {
        expect(expr.hasNext()).toBe(true);
        const next = expr.next();
        expect(next).toBeInstanceOf(CronDate);
      }
    });

    test('throws error for non-existing file', async () => {
      await expect(CronFileParser.parseFile('./nonexistent.txt')).rejects.toThrow('File not found');
      expect(fsPromises.readFile).toHaveBeenCalledWith('./nonexistent.txt', 'utf8');
    });
  });

  describe('parseFileSync', () => {
    test('reads and parses a valid crontab file synchronously', () => {
      const result = CronFileParser.parseFileSync('tests/crontab.example');

      expect(Object.keys(result.variables)).toHaveLength(2);
      expect(Object.keys(result.errors)).toHaveLength(0);
      expect(result.expressions).toHaveLength(3);
      expect(fs.readFileSync).toHaveBeenCalledWith('tests/crontab.example', 'utf8');

      // Verify expressions are valid
      for (const expr of result.expressions) {
        expect(expr.hasNext()).toBe(true);
        const next = expr.next();
        expect(next).toBeInstanceOf(CronDate);
      }
    });

    test('throws error for non-existing file', () => {
      expect(() => CronFileParser.parseFileSync('./nonexistent.txt')).toThrow('File not found');
      expect(fs.readFileSync).toHaveBeenCalledWith('./nonexistent.txt', 'utf8');
    });

    test('handles invalid expressions', () => {
      const result = CronFileParser.parseFileSync('./temp-invalid.txt');

      expect(result.variables).toEqual({ FOO: 'bar' });
      expect(result.expressions).toHaveLength(2);
      expect(Object.keys(result.errors)).toHaveLength(1);
      expect(result.errors).toHaveProperty('invalid expression here');
      expect(fs.readFileSync).toHaveBeenCalledWith('./temp-invalid.txt', 'utf8');
    });
  });
});
