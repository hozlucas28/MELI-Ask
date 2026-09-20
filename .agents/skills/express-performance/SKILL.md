---
name: express-performance
description: Improve Express API performance and reliability using the official Express production practices. Use when reviewing request throughput, response size, logging, exception handling, CPU-bound work, runtime configuration, or deployment topology.
---

# Express Performance and Reliability

Apply the official Express production guidance proportionally to the workload and deployment environment.

- Avoid synchronous work on request paths. Use asynchronous Node APIs; reserve synchronous operations for startup only.
- Use structured logging rather than `console` for application activity, and keep request logs free of sensitive payloads and headers.
- Use response compression when no reverse proxy is already responsible for it. Do not duplicate proxy-level compression without an operational reason.
- Propagate asynchronous failures to Express error handlers and handle expected errors close to the operation that can recover from them. Do not keep a process alive after an uncaught exception.
- Offload genuinely CPU-bound request work to a reusable worker pool; do not introduce worker threads for ordinary I/O or lightweight validation.
- For production, use a current Node LTS release, set `NODE_ENV=production`, and rely on deployment infrastructure for restart, TLS termination, reverse proxying, caching, load balancing, and horizontal scaling. Keep application state out of process memory before scaling across instances.

Source: https://expressjs.com/en/advanced/best-practice-performance/
