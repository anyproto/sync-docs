---
title: Overview
description: any-sync and any-sdk provide encrypted shared state for long-lived human-agent collaboration.
---

**`any-sync`** is a peer-to-peer protocol for building human-agent collaboration systems. It lets humans, agents, and devices work on the same end-to-end encrypted, permissioned state. No central server, orchestrator, or sync backend has to be trusted with collaboration authority.

**`any-sdk`** is an embedded library that turns shared state into a reactive local object database. Spaces, objects, permissions, queries, subscriptions, history, and traces become primitives for agentic applications, with no application sync backend to deploy and no server round trips for local reads and writes.

It is designed for long-lived work that cannot be reduced to chat messages, tool calls, or one application's database. Security audited by Cure53.

## Motivation

Agent infrastructure is built around messages, tools, orchestrators, files, and backend databases. MCP gives agents access to tools, A2A lets them exchange messages, and memory is usually a markdown file on a disk or a context database over HTTP. That works for short-term tasks. Long-running collaboration depends on something else: the project, task graph, document, dataset, decisions, and traces that keep changing after any single message is gone.

The usual memory substrates are not enough. Files and git make state durable and inspectable, but they merge text rather than structure, so agents end up parsing files that no schema checks, maintaining side indexes, and walking diffs to reconstruct what is current. A remote database gives you structure and queries, but it puts every read and write behind a server that has to be reachable, centralizes authority over the workspace, and leaves versioning, conflict detection, offline work, and merge behavior to your application code. Without that machinery, concurrent writes collapse into last-write-wins by default: when two agents touch the same record, the earlier write silently disappears.

You can see the missing layer in what teams build to compensate. Markdown memory grows typed frontmatter, claims files, proposed-write inboxes, and search indexes that someone has to patch every time the files change. Database memory grows version columns, retry loops, merge workers, and audit tables. Serious setups converge on the same hand-assembled engine: typed shared state with queries, history, permissions, and rules for concurrent writes.

## The core idea

The context humans and agents share should live as shared state, not as messages. It is an old idea. Tuple spaces and blackboard systems treated shared state as the coordination layer decades ago; any-sync rebuilds that idea for encrypted, permissioned, offline collaboration over infrastructure that does not own the workspace.

CRDTs let peers write independently and converge later. A signed DAG records who changed what, when, and under what authority. any-sync moves encrypted changes between peers and providers; any-sdk turns those changes into objects, queries, permissions, subscriptions, history, and traces.

The result is one engine instead of five systems and the glue between them. Convergence, permissions, encryption, queries, and provenance operate over the same objects, so humans, agents, and devices can collaborate on evolving state without trusting a central backend to read the data or referee the collaboration.

## Key features

- **Shared human-agent workspaces**: Humans and agents work on the same objects through different interfaces.
- **Cross-org collaboration**: Organizations collaborate without giving one party's backend ownership of the workspace.
- **Offline handoff**: Agents can continue after disconnection, leave work in shared state, and let humans or other agents pick it up later.
- **Generated UI backed by state**: Dashboards, forms, review flows, and agent-generated interfaces are live views over shared objects.
- **Flexible agent-native data**: Objects can combine typed fields, free-form content, metadata, derived state, and evolving schemas.
- **Multi-dimensional memory**: Shared objects can be materialized as graphs, tables, timelines, task queues, documents, traces, or vector indexes.
- **Audit by construction**: Signed DAG history records provenance, permissions, and change context.
- **Untrusted sync infrastructure**: Providers store and relay encrypted data without owning collaboration authority.

## How the stack works

There are two layers exposed to developers: the sync protocol and the SDK.

- **any-sync**: encrypted peer-to-peer sync. It moves bytes between devices and peers through whichever provider you choose, merges concurrent changes, and maintains the signed history.
- **any-sync SDK**: unpacks those bytes into a reactive local database and an API, so that spaces, objects, permissions, subscriptions, queries, and history become ordinary primitives for your application and your agents.

## Inside a space

Each space is a document-oriented database. Objects with different schemas live in the same collection, and you can query across whatever fields they have in common, so adding a new kind of object does not require a migration. It has better ergonomics for agents as they are not constrained by schemas and can evolve object properties on the fly.

Full-text and vector search are landing in the same engine, over the same objects and permissions, which will give you hybrid retrieval without separate services to deploy and keep consistent.

Subscriptions are part of the engine. A query is a live view that updates whenever any peer, human or agent, changes a matching object, and on the frontend this collapses into a hook.

Every object keeps its history, and concurrent edits are merged at the level of individual properties, so nothing gets lost without a record of it. All of this runs locally, so an agent's reads and writes never wait on the network.

## Coordination without locks

Concurrent agents need coordination, but long-running agent work does not fit neatly into locks or interactive read-modify-write loops. any-sdk makes conflicts explicit instead of letting them disappear.

Properties are typed, so an agent cannot silently turn a number into a string. Writes can be conditioned on the version the agent read, so stale writes return conflicts instead of overwriting newer state. When two agents update the same property, history preserves the previous value. When two agents create ambiguous same-name objects, both survive as visible forks that a human or agent can merge later.

Centralized transactional systems can provide strong guarantees, but usually by relying on an online coordinator. any-sync takes a different approach: peers can write locally, sync later, and preserve divergence as history until it is resolved.

## Traces and provenance

Changes can carry trace IDs that tie together everything a task or a chat message touched. A month later you can ask where an object came from and follow the trace back to the message that started it, through the program the agent generated, to the objects it created, including ones that were deleted along the way, which you can restore.

Sources point at specific versions of objects, so when a source changes after something cited it, the mismatch is detectable mechanically; the validation workflows on top of this are still being built. Agents working in parallel can also read each other's traces, see that another agent is busy with a neighboring problem, and stay out of its way.

## Alternatives

Files plus git are simple, durable, and inspectable. They work well when the state is mostly text and review happens through commits. But agents still have to reconstruct current state from files and diffs, maintain indexes, and enforce structure outside the system.

A DIY local-first stack is possible: Automerge or Yjs for convergence, SQLite for queries, Electric or Turso for sync, and custom code between them. Each component is useful, but the hard work lives in the seams: projection, query invalidation, search, permissions, encryption, membership changes, and conflict handling.

If you only need one collaborative document through a server you control, Yjs and a websocket are simpler. any-sync is for applications that need encrypted, permissioned, local-first spaces where convergence, queries, permissions, encryption, and history operate over the same objects.

## Trust and maturity

Spaces are end-to-end encrypted, so objects, files, messages, generated UI state, and agent work stay private from sync providers. Providers can store and relay encrypted bytes, but they cannot read space contents or grant themselves access. Access is governed by each space's permissions, identity, and signed history.

The sync protocol has been running in production in Anytype for four years and has been audited by Cure53, with the report available on request. any-sdk is newer and still under active development.

## Limitations

any-sdk is early and its API will change. Full-text and vector search are new parts of the engine, landing now rather than long-proven. Because sync providers cannot read your data, indexes and queries run on user devices, so a space is bounded by local storage and compute. Human tooling for reviewing and merging forks is basic today.

## Closing

any-sync moves encrypted bytes between peers; any-sdk turns them into local objects that applications and agents can query, observe, modify, and trace. The pieces are familiar on their own. The work is in making convergence, queries, permissions, encryption, and history operate over the same objects at once.

any-sdk is early, and we are looking for developers building long-lived human-agent collaboration systems.
