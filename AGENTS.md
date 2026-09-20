# Agent Instructions

## Maintaining This File

- Treat this file as the durable source of truth for repository-specific agent behavior.
- Add every developer preference, correction, decision, or convention expressed during an agent session to this file as part of the same change.
- If a new preference conflicts with an existing rule in this file, ask the developer whether to update this file before applying the conflicting preference.

## API Architecture

- This repository is an API-only project.
- Keep API versions autonomous. Each version owns its routes, controllers, schemas, repositories, types, enums, and middleware under `src/<version>`.
- Mount versioned endpoints under `/api/<version>`.
- Use `src/shared` only for genuinely cross-version concerns, such as logging.
- Keep application construction separate from server startup so integration tests can create isolated application instances without opening the development server port.

## API and Data Rules

- The current API version exposes product, comment, and reply endpoints under `/api/v1`.
- Products are hardcoded. Comments and replies are temporarily persisted in memory through repositories until a database implementation replaces them.
- Every ID must be a UUID.
- Model relationships between entities through the applicable ID.
- Validate every request parameter and body with Zod middleware before it reaches a controller.
- Comment and reply bodies use UUID author identifiers and content limited to 4 through 1024 characters.
- Use the HTTP status enum for error responses.

## TypeScript and Design Conventions

- Use `type` for data shapes. Use `interface` only for behavioral contracts, such as repository interfaces.
- Keep type-only imports separate and use `import type`.
- Use named exports only. Place value exports at the end of the module and type exports in a separate `export type { ... }` statement.
- Name repository contracts and implementations in plural form.
- Repository implementations must be classes with explicit constructors. Initialize attribute values inside constructors, not in field declarations.
- Controllers must be classes that depend on repository interfaces rather than concrete implementations.
- Instantiate concrete repositories and inject them from route composition files.
- Never instantiate an object directly inside another object instantiation. Store each dependency in a named variable first.
- When a custom function, method, or constructor needs more than one input, accept a single object of named parameters.
- Prefix every pending comment with `TODO:`.
- Write an `if` with one following statement on one line and without braces. Do not leave blank lines between consecutive guard `if` statements.

## Testing and Automation

- Do not manually run formatting or linting commands. Agent hooks are configured to perform those checks automatically.
