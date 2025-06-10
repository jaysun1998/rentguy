# RentGuy Coding Standards & Development Guidelines

## Table of Contents
- [Backlog Management](#backlog-management)
- [Story Types & Estimation](#story-types--estimation)
- [Coding Style Guidelines](#coding-style-guidelines)
- [Testing Strategy (TDD/BDD)](#testing-strategy-tddbdd)
- [Architecture & Design Patterns](#architecture--design-patterns)
- [API Design](#api-design)
- [Database Guidelines](#database-guidelines)
- [Security & Compliance](#security--compliance)
- [CI/CD Pipeline](#cicd-pipeline)
- [Version Control (GitHub)](#version-control-github)

## Backlog Management

### Workflow
1. **Start** the top unstarted story in the backlog
2. **Branch Naming**:
   - `feature/{id}` for new features (e.g., `feature/US-2.2`)
   - `bug/{id}` for bug fixes
   - `chore/{id}` for maintenance tasks
3. **TDD Workflow**:
   - Write failing tests (**WIP: Red Tests**)
   - Implement code to make them pass (**WIP: Green Tests**)
   - Refactor and commit (**Refactor complete**)
4. **Pull Request Process**:
   - Mark story **Finished**
   - Create a **PR** with a clear description
   - Trigger a build
   - Request review from at least one team member
5. **PM Review**: 
   - Product Manager accepts or rejects the story
   - If accepted, mark as **Delivered**
   - If rejected, provide clear feedback and move back to **In Progress**

## Story Types & Estimation

### Classification
- **Feature**: New functionality (e.g., "As a property manager, I want to add a new property")
- **Bug**: Fix for incorrect behavior (e.g., "Property creation fails with special characters in name")
- **Chore**: Maintenance tasks (e.g., "Update dependencies")

### Estimation (Fibonacci Scale)
- **0** - Trivial changes (<15 mins)
- **1** - Simple task (~2-4 hours)
- **2** - Small feature (~1 day)
- **3** - Medium feature (~2-3 days)
- **5** - Large feature (~1 week)
- **8** - Very large feature (break down further)

## Coding Style Guidelines

### General
- **Language**: Python (Backend), TypeScript/JavaScript (Frontend)
- **Formatting**:
  - Python: Black for formatting, isort for imports
  - TypeScript/JavaScript: Prettier, ESLint
- **Naming**:
  - Python: snake_case for variables/functions, PascalCase for classes
  - TypeScript: camelCase for variables/functions, PascalCase for classes/interfaces
  - Database: snake_case for tables/columns

### Backend (Python/FastAPI)
- Follow FastAPI best practices
- Use Pydantic models for request/response validation
- Keep business logic in service layer
- Use dependency injection for better testability
- Document all public APIs with docstrings

### Frontend (React/TypeScript)
- Functional components with hooks
- Type everything with TypeScript
- Use React Query for data fetching
- Follow component composition pattern
- Keep business logic in custom hooks

## Testing Strategy (TDD/BDD)

### Test Pyramid
1. **Unit Tests (70%)**
   - Test individual functions/components in isolation
   - Mock external dependencies
   - Fast execution

2. **Integration Tests (20%)**
   - Test service interactions
   - Use test database for backend
   - Mock external services

3. **E2E Tests (10%)**
   - Test critical user journeys
   - Use Playwright for browser automation
   - Run in CI/CD pipeline

### BDD Structure
```typescript
describe('Property Management', () => {
  describe('Create Property', () => {
    it('should create a new property with valid data', async () => {
      // Given
      const propertyData = {
        name: 'Downtown Apartments',
        address_line1: '123 Main St',
        city: 'Berlin',
        country_iso: 'DE',
        property_type: 'residential',
        default_vat_rate: 19.0
      };
      
      // When
      const response = await createProperty(propertyData);
      
      // Then
      expect(response.status).toBe(201);
      expect(response.data).toMatchObject({
        name: propertyData.name,
        city: propertyData.city,
        status: 'active'
      });
    });
  });
});
```

## Architecture & Design Patterns

### Microservices
1. **User Service**: Authentication, authorization, user profiles
2. **Property Service**: Property and unit management
3. **Lease Service**: Lease lifecycle management
4. **Finance Service**: Invoicing and accounting
5. **Payment Service**: Payment processing
6. **Document Service**: File storage and management

### Communication
- Synchronous: REST APIs for client communication
- Asynchronous: Message queues for cross-service communication
- Event-driven architecture for decoupled services

### Design Principles
- Single Responsibility Principle
- Domain-Driven Design (DDD)
- Clean Architecture
- CQRS for complex domains

## API Design

### REST Guidelines
- Use nouns, not verbs in URLs
- Plural resource names (e.g., `/properties`, `/units`)
- Consistent casing (kebab-case for URLs, camelCase for JSON)
- Versioning in URL (e.g., `/api/v1/properties`)

### Response Format
```json
{
  "data": {},
  "meta": {},
  "errors": []
}
```

### Error Handling
- Use standard HTTP status codes
- Consistent error response format
- Detailed error messages in development
- Log all errors with correlation IDs

## Database Guidelines

### Schema Design
- Use UUIDs as primary keys
- Add `created_at` and `updated_at` timestamps
- Use constraints (NOT NULL, FOREIGN KEY, UNIQUE)
- Document all tables and columns

### Migrations
- Use Alembic for database migrations
- Write idempotent migration scripts
- Include rollback scripts
- Test migrations in staging before production

### Performance
- Add indexes for frequently queried columns
- Use connection pooling
- Implement pagination for large result sets
- Monitor slow queries

## Security & Compliance

### GDPR Compliance
- Encrypt PII at rest and in transit
- Implement right to be forgotten
- Log all data access
- Regular security audits

### Authentication & Authorization
- JWT for stateless authentication
- Role-based access control (RBAC)
- OAuth2 for third-party integrations
- Rate limiting and throttling

### Data Protection
- Encrypt sensitive data
- Regular backups
- Data retention policies
- Audit trails for sensitive operations

## CI/CD Pipeline

### Build & Test
- Run linters and formatters
- Execute unit and integration tests
- Run security scans
- Build Docker images

### Deployment
- Blue-green deployments
- Feature flags for gradual rollouts
- Automated database migrations
- Health checks and monitoring

### Environments
- Development
- Staging (mirror of production)
- Production

## Version Control (GitHub)

### Branching Strategy
- `main` - Production releases
- `staging` - Staging environment
- `feature/*` - Feature branches
- `bugfix/*` - Bug fixes
- `release/*` - Release preparation

### Commit Messages
- Use conventional commits:
  - `feat:` New feature
  - `fix:` Bug fix
  - `docs:` Documentation changes
  - `style:` Code style changes
  - `refactor:` Code refactoring
  - `test:` Adding or modifying tests
  - `chore:` Maintenance tasks

### Pull Requests
- Link to related issue
- Clear description of changes
- Screenshots for UI changes
- All tests must pass
- Code review required before merge

## Documentation

### API Documentation
- OpenAPI/Swagger for REST APIs
- Examples for all endpoints
- Authentication requirements
- Error responses

### System Documentation
- Architecture diagrams
- Data flow diagrams
- Deployment procedures
- Troubleshooting guides

### Runbook
- Common procedures
- Known issues and workarounds
- Contact information
- Escalation procedures

## Monitoring & Observability

### Logging
- Structured logging (JSON)
- Correlation IDs for requests
- Appropriate log levels
- Sensitive data redaction

### Metrics
- Request rates and latencies
- Error rates
- Resource utilization
- Business metrics

### Alerting
- Set up alerts for critical issues
- Define escalation policies
- Regular alert reviews
- False positive reduction
