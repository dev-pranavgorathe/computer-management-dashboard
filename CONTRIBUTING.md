# Contributing Guide

Thank you for your interest in contributing to the Computer Management Dashboard!

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** first
2. **Use the bug report template**
3. **Include details:**
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Browser/device info

### Suggesting Features

1. **Open a discussion** first
2. **Describe the feature** in detail
3. **Explain the use case**
4. **Wait for approval** before implementing

### Code Contributions

#### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/computer-management-dashboard.git
   cd computer-management-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

#### Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow coding standards
   - Add tests
   - Update documentation

3. **Test your changes**
   ```bash
   npm test
   npm run build
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: describe your feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Reference related issues
   - Describe changes clearly
   - Request review

---

## 📏 Coding Standards

### TypeScript

- **Strict mode enabled**
- **Explicit types** for functions
- **No `any` types** without justification
- **Use interfaces** for object shapes

**Example:**
```typescript
// ✅ Good
interface Shipment {
  id: string;
  podName: string;
  status: ShipmentStatus;
}

function createShipment(data: ShipmentCreateInput): Promise<Shipment> {
  // ...
}

// ❌ Bad
function createShipment(data: any): any {
  // ...
}
```

### React Components

- **Functional components only**
- **Use hooks** for state/effects
- **Prop types with TypeScript**
- **Keep components small**

**Example:**
```typescript
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// ❌ Bad
export class Button extends React.Component {
  // ...
}
```

### API Routes

- **Validate all inputs** with Zod
- **Return proper status codes**
- **Handle errors gracefully**
- **Include error details**

**Example:**
```typescript
// ✅ Good
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    
    const result = await create(validated);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Database

- **Use Prisma ORM** for all queries
- **Transaction for related changes**
- **Soft delete** instead of hard delete
- **Index frequently queried fields**

**Example:**
```typescript
// ✅ Good
const shipment = await prisma.shipment.findUnique({
  where: { id },
  include: { user: true }
});

// ❌ Bad
const shipment = await prisma.$queryRaw`
  SELECT * FROM shipments WHERE id = ${id}
`;
```

---

## 🎨 Style Guidelines

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ShipmentCard` |
| Functions | camelCase | `createShipment` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_ITEMS` |
| Files | kebab-case | `shipment-card.tsx` |
| Database tables | snake_case | `shipments` |

### File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── (routes)/          # Page routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── [feature]/        # Feature-specific components
├── lib/                   # Utilities
│   ├── prisma.ts         # Database client
│   ├── auth.ts           # Auth helpers
│   └── validations.ts    # Zod schemas
└── types/                 # TypeScript types
```

### Import Order

```typescript
// 1. External packages
import { useState } from 'react';
import { NextRequest } from 'next/server';

// 2. Internal packages
import { prisma } from '@/lib/prisma';

// 3. Components
import { Button } from '@/components/ui/button';

// 4. Types
import type { Shipment } from '@/types';

// 5. Styles (if any)
import styles from './styles.module.css';
```

---

## ✅ Testing

### Unit Tests

**Using Jest and React Testing Library:**

```typescript
// __tests__/components/button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Integration Tests

**API Route Testing:**

```typescript
// __tests__/api/shipments.test.ts
import { POST } from '@/app/api/shipments/route';

describe('POST /api/shipments', () => {
  it('creates a shipment', async () => {
    const request = new NextRequest({
      method: 'POST',
      body: JSON.stringify({ podName: 'Test' })
    });
    
    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific file
npm test -- shipments.test.ts

# Coverage report
npm test -- --coverage
```

---

## 📝 Documentation

### Code Comments

**When to comment:**
- Complex logic
- Non-obvious decisions
- Workarounds
- TODOs with issue numbers

**Example:**
```typescript
// HACK: Normalize Ghana numbers to India format
// TODO: Remove this after migration to international format (#123)
function normalizeMobileNumber(input: string): string {
  if (value.startsWith('+233')) return `+91${value.slice(4)}`;
  return value;
}
```

### README Updates

Update README.md when:
- Adding new features
- Changing configuration
- Updating dependencies
- Modifying setup process

### API Documentation

Update API_DOCUMENTATION.md when:
- Adding new endpoints
- Changing request/response formats
- Modifying authentication requirements

---

## 🔍 Code Review Process

### Before Submitting PR

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] Documentation updated
- [ ] PR description complete

### Review Criteria

**Reviewers check for:**
- Code quality
- Test coverage
- Performance impact
- Security concerns
- Documentation clarity
- Breaking changes

---

## 🚀 Release Process

### Version Bumping

**Semantic Versioning:**
- **MAJOR** - Breaking changes
- **MINOR** - New features
- **PATCH** - Bug fixes

### Changelog

Update CHANGELOG.md:
```markdown
## [1.1.0] - 2026-03-18
### Added
- Export to Excel feature
### Fixed
- Mobile number validation error
### Changed
- Improved dashboard performance
```

---

## 🆘 Getting Help

- **Documentation:** Check `/docs` folder
- **Issues:** [GitHub Issues](https://github.com/username/repo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/username/repo/discussions)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing! 🎉**
