---
name: tauri-patterns
description: Tauri desktop application conventions for command design, IPC, state, events, and window lifecycle. Use when writing, reviewing, or modifying Tauri code.
license: MIT
compatibility: opencode
---

# Tauri Patterns

## Command Design

- Input: explicit typed struct (`#[derive(serde::Deserialize)]`), never raw `serde_json::Value`
- Output: `Result<T, AppError>` with a unified error type in `error.rs`
- Commands do parameter validation + delegation only; business logic lives in the service layer
- Long-running tasks use `async` + event reporting; never block a command

## IPC / Event Contract

- Payload structures live in `src-tauri/src/contracts/`, shared by frontend and backend
- Event naming: `kebab-case`, consistent with the publisher
- Type changes must sync all callers and be marked breaking

## State Management

- App state uses `tauri::State<T>` injection with `T: Send + Sync + 'static`
- Do not wrap the entire state in a `Mutex`; use layered locking
- Frontend state lives in a store (zustand/pinia); do not rely on backend persistent state

## Window Lifecycle

- Multi-window uses `WebviewWindowBuilder` with `kebab-case` tags
- Clean up in `on_window_event` before window close
- Special windows (system tray, overlay) follow their framework's conventions

## Error Handling

- Custom `AppError` enum implementing `serde::Serialize` for the frontend
- Never `unwrap()` inside commands; propagate with `?`
- Register a panic hook in `tauri::Builder::default().setup()` for fatal errors
