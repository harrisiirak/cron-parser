# Contributing to cron-parser

Thank you for your interest in contributing to cron-parser! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Benchmarking](#benchmarking)
- [Documentation](#documentation)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project and everyone participating in it are governed by a commitment to creating a welcoming and inclusive environment. Please be respectful in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/cron-parser.git
   cd cron-parser
   ```
3. **Add the original repository as upstream**:
   ```bash
   git remote add upstream https://github.com/harrisiirak/cron-parser.git
   ```

## Development Setup

### Prerequisites

- Node.js >= 18
- npm (comes with Node.js)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the project:

   ```bash
   npm run build
   ```

3. Run tests to ensure everything works:
   ```bash
   npm test
   ```

### Available Scripts

- `npm run build` - Build the TypeScript project
- `npm run test` - Run all tests (lint + type check + unit tests + coverage)
- `npm run test:unit` - Run unit tests only
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run bench` - Run benchmarks
- `npm run docs` - Generate documentation

## How to Contribute

### Types of Contributions

- **Bug fixes** - Fix issues in the existing codebase
- **Features** - Add new functionality
- **Documentation** - Improve or add documentation
- **Code improvements** - Refactoring, optimization, code quality
- **Tests** - Add or improve test coverage
- **Performance** - Performance optimizations

### Before You Start

1. **Check existing issues** to see if your contribution is already being worked on
2. **Create an issue** to discuss new features or significant changes
3. **Look for good first issues** labeled with `good first issue` for newcomers

## Pull Request Process

1. **Create a feature branch** from `master`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Write or update tests** for your changes

4. **Run the test suite** and ensure all tests pass:

   ```bash
   npm test
   ```

5. **Update documentation** if needed

6. **Commit your changes** with a clear commit message:

   ```bash
   git commit -m "feat: add support for new cron expression syntax"
   ```

7. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a pull request** on GitHub

### Pull Request Guidelines

- **Clear title and description** explaining the changes
- **Reference related issues** using keywords like "Fixes #123" or "Closes #456"
- **Include test coverage** for new functionality
- **Update documentation** for user-facing changes
- **Keep commits atomic** - one logical change per commit
- **Rebase your branch** on the latest master before submitting

### Commit Message Format

This project follows conventional commits format:

```
type(scope): short description

[optional body]

[optional footer]
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks, dependency updates

**Examples:**

```
feat: add support for timezone in cron expressions
fix: handle edge case in day of week calculation
docs: update README with new examples
test: add coverage for CronDate edge cases
```

## Coding Standards

### TypeScript

- **Use TypeScript** for all source code
- **Enable strict mode** - the project uses strict TypeScript settings
- **Provide proper type annotations** for public APIs
- **Use meaningful variable and function names**
- **Follow existing code patterns** and conventions

### Code Style

- **Use Prettier** for code formatting (configuration in `.prettierrc`)
- **Use ESLint** for code linting (configuration in `eslint.config.js`)
- **Run `npm run format`** before committing
- **Fix lint issues** with `npm run lint:fix`

### File Organization

- **Source code**: Place in `src/` directory
- **Tests**: Place in `tests/` directory with `.test.ts` extension
- **Exports**: Update `src/index.ts` for public API changes
- **Types**: Define types in appropriate files, shared types in `src/fields/types.ts`

## Testing

### Unit Tests

- **Write tests** for all new functionality
- **Use Jest** as the testing framework
- **Place tests** in the `tests/` directory
- **Follow the naming convention**: `ComponentName.test.ts`
- **Maintain high test coverage**

### Test Structure

```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = 'test input';

      // Act
      const result = component.method(input);

      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('should throw error for invalid input', () => {
      expect(() => component.method(invalidInput)).toThrow('Expected error message');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:unit -- --watch

# Run specific test file
npm run test:unit -- CronExpression.test.ts

# Run tests with coverage
npm run test:coverage
```

## Benchmarking

The project includes benchmarking tools to measure performance:

```bash
# Run benchmarks
npm run bench

# Run pattern-specific benchmarks
npm run bench:pattern

# Clean benchmark results
npm run bench:clean
```

When making performance-related changes:

1. **Run benchmarks before** your changes to establish baseline
2. **Run benchmarks after** your changes to measure impact
3. **Include benchmark results** in your pull request description

## Documentation

### Code Documentation

- **Document public APIs** with JSDoc comments
- **Include examples** in documentation where helpful
- **Update TypeScript definitions** for exported types

### README Updates

- **Update examples** when adding new features
- **Update API documentation links** if needed
- **Keep the feature list current**

### API Documentation

The project uses TypeDoc for API documentation:

```bash
npm run docs
```

## Issue Guidelines

### Bug Reports

When reporting bugs, please use the bug report template and include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment information** (Node.js version, OS, etc.)
- **Minimal code example** that demonstrates the issue

### Feature Requests

For feature requests, please:

- **Explain the use case** and why the feature would be useful
- **Provide examples** of how the feature would be used
- **Consider backwards compatibility** implications
- **Check if similar functionality** already exists

### Questions

For questions about usage:

- **Check the README** and API documentation first
- **Search existing issues** for similar questions
- **Provide context** about what you're trying to achieve
- **Include relevant code examples**

## Getting Help

- **Read the documentation**: [API docs](https://harrisiirak.github.io/cron-parser/)
- **Browse examples** in the README
- **Check existing issues** on GitHub
- **Ask questions** by creating an issue with the "question" label

## Recognition

Contributors will be acknowledged in:

- **GitHub contributors list**
- **Release notes** for significant contributions
- **Special mentions** for major features or fixes

Thank you for contributing to cron-parser!
