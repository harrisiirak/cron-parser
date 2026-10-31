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

  describe.each(['parseFile', 'parseFileSync'] as const)('%s field separators', (method) => {
    test.each([
      { name: 'repeated spaces', separator: '   ' },
      { name: 'tabs', separator: '\t' },
      { name: 'mixed spaces and tabs', separator: ' \t ' },
    ])('preserves a weekday schedule with $name', async ({ separator }) => {
      const content = ` \t${['15', '9', '*', '*', '1-5', '/usr/bin/report'].join(separator)}\t \r\n`;
      if (method === 'parseFile') {
        (fsPromises.readFile as jest.Mock).mockResolvedValueOnce(content);
      } else {
        (fs.readFileSync as jest.Mock).mockReturnValueOnce(content);
      }

      const result = await CronFileParser[method]('tests/crontab.example');

      expect(result.errors).toEqual({});
      expect(result.variables).toEqual({});
      expect(result.expressions).toHaveLength(1);
      const [expression] = result.expressions;
      expect(expression.stringify()).toBe('15 9 * * 1-5');
      expression.reset(new Date('2026-09-25T09:15:00.000Z'));
      expect(expression.next().toISOString()).toBe('2026-09-28T09:15:00.000Z');
    });
  });

  describe('variable detection', () => {
    const parse = (content: string) => {
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(content);
      return CronFileParser.parseFileSync('tests/crontab.example');
    };

    test.each([
      { name: 'a --option=value argument', line: '0 3 * * * /usr/bin/backup --dest=/mnt/x', schedule: '0 3 * * *' },
      { name: 'an inline FOO=bar assignment', line: '*/5 * * * * FOO=bar /bin/job', schedule: '*/5 * * * *' },
    ])('keeps a schedule whose command has $name', ({ line, schedule }) => {
      const result = parse(line);

      expect(result.errors).toEqual({});
      expect(result.variables).toEqual({});
      expect(result.expressions.map((expression) => expression.stringify())).toEqual([schedule]);
    });

    test('splits a variable at the first =', () => {
      const result = parse('JAVA_OPTS=-Dfoo=bar');

      expect(result.variables).toEqual({ JAVA_OPTS: '-Dfoo=bar' });
      expect(result.expressions).toHaveLength(0);
    });

    test('allows spaces around the = of a variable', () => {
      const result = parse('MAILTO = me@example.com');

      expect(result.variables).toEqual({ MAILTO: 'me@example.com' });
      expect(result.expressions).toHaveLength(0);
    });
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

    test('keeps a line named __proto__ as an own property instead of replacing the prototype', () => {
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(['__proto__', '__proto__=polluted', 'ok=1'].join('\n'));
      const result = CronFileParser.parseFileSync('./temp-proto.txt');

      expect(Object.getPrototypeOf(result.errors)).toBe(Object.prototype);
      expect(Object.getPrototypeOf(result.variables)).toBe(Object.prototype);
      expect(Object.keys(result.errors)).toEqual(['__proto__']);
      expect(Object.keys(result.variables)).toEqual(['__proto__', 'ok']);
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
