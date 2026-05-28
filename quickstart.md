---
icon: arrows-to-circle
---

# Concepts

`any-sync` is a protocol that uses several data abstractions to create a cryptographic asset called a **Space** (also referred to as a **Channel**). These abstractions are designed to enable synchronization, replication, and collaboration across multiple devices and users, all while maintaining robust access control and security.

***

### Space (Channel)

A **Space** is a cryptographic asset that encapsulates a collection of digital **Objects**, governed by an **Access Control List (ACL)**. It serves as a fundamental unit for:

* **Synchronization**: Ensuring consistent updates across devices.
* **Replication**: Storing copies of data to facilitate data availability and durability.
* **Sharing**: Allowing controlled collaboration among different users.
* **Access Control**: Defining permissions through the ACL to manage who can read, modify, or add data.

Each **Space** typically belongs to a single user and can be accessed from multiple devices that user owns. When multiple users collaborate within the same Space, data from each participant’s devices is shared and managed collectively. ACLs define the permissions for these users.

Spaces can be stored locally (on a user’s device) or on **Sync Nodes** in the external network. If the ACL is modified:

1. The Sync Node requests validation from a **Consensus Node**.
2. If valid, the ACL is updated on the Sync Node, which propagates the change to other Sync Nodes.
3. If invalid, the change is rejected.

_Note: Updating an ACL requires an active connection to the external network._

***

### Object

An **Object** in `any-sync` is a directed acyclic graph (DAG) of content identifiers (**CIDs**). It uses **Conflict-Free Replicated Data Types (CRDTs)** to ensure that updates from multiple devices remain consistent. Each Object starts with a root (representing its initial state) and captures subsequent modifications over time.

Essentially, Objects in `any-sync` function as immutable logs of changes, forming a complete history of all modifications. This history allows clients to reconstruct any previous state of the Object when needed independently from each other.

***

### Change

A **Change** is the smallest syncable, content-addressable data abstraction in `any-sync`. Changes are linked together to form a DAG that makes up the state of an Object. The final Changes (those without further modifications) are referred to as **object heads**. Each Change is associated with the **ACL head** current at the time the Change was created.

Changes inherently provide the following key properties:

1. **Immutability**\
   Once enacted, a Change cannot be altered—only built upon—guaranteeing a permanent and unalterable history.
2. **Verifiability**\
   The sequence of Changes is fully traceable, allowing users to revert to any previous state without undermining the system’s integrity. This feature is critical for audits and maintaining trust.
3. **Concurrency**\
   Multiple Changes can be made independently and then merged, a design crucial for distributed, collaborative environments where simultaneous updates may occur.

***

### Access Control List (ACL)

An **ACL** in `any-sync` is a content-addressable, strictly ordered list of records, with its identifier defined by the initial record in the list. The “head” of the list points to the most recent ACL record.

Each record may include:

* Addition of a new Identity
* Modification or removal of an existing Identity
* Permission changes
* Encryption key changes

(_Additional record types can be introduced in the future._)

All Object Changes in a Space reference the **current ACL head** at the time those Changes are made, ensuring consistent permission checks.

***

### Conflict Resolution

`any-sync` is built for multi-device and multi-user collaboration, which can lead to multiple **heads** for a single Object (i.e., parallel local states). Whenever a user commits a new Change to an Object with multiple heads, the new Change references each head to effectively merge them into a unified state.

To reconstruct the current state of an Object:

1. Start from a given head.
2. Follow the DAG of CIDs corresponding to each prior Change.
3. If multiple heads or multiple paths exist, a **topological sort** based on the hash values of each Change is used to establish the correct ordering.

This ensures that all concurrent Changes are incorporated in a consistent manner.

***

### Snapshots

To streamline state retrieval, `any-sync` allows probabilistic promotion of certain Changes to **snapshots**. A snapshot is a point-in-time representation of an Object’s state that removes the need to traverse all previous Changes. By referring to a snapshot, the protocol significantly reduces the computational overhead of reconstructing an Object’s current state.

Because `any-sync` is client-agnostic, applications can use these snapshots (and the entire DAG of Changes) to build their own internal application state, adapting the data to fit specific requirements.

***

### Files

File handling in `any-sync` is split into two parts: **data storage** and **data retrieval**.

* **Data Storage**:\
  Files are represented as IPLD (InterPlanetary Linked Data) structures, stored either locally on user devices or on dedicated **file-nodes** in the external network. This simple topology helps maintain efficiency.
* **Data Retrieval**:\
  `any-sync` provides its own retrieval mechanism, typically through direct connections to file-nodes or peers. It does not rely on Bitswap (a protocol designed for more complex, large-scale networks).

***

#### Summary

In summary, `any-sync` revolves around the concept of Spaces, which manage Objects via Changes and are governed by ACLs. The system’s design ensures immutability, verifiability, and concurrency, while offering efficient mechanisms (such as snapshots) for retrieving current states. File processing is built on IPLD, highlighting the protocol’s focus on content addressability and efficient, direct retrieval.

This architectural approach allows `any-sync` to remain modular, flexible, and client-agnostic, making it suitable for diverse applications requiring collaborative, secure, and verifiable data synchronization.

