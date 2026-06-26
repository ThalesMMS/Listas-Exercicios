# PA4 — Semantic Analysis: Overview

> **What PA4 does:** takes the AST from the parser (PA3) and (1) checks the program
> is semantically legal, (2) **decorates every `Expression` node with a type** by
> calling `set_type()`. All the work lives in `PA4/semant.cc` (+ `semant.h`).

Entry point: `program_class::semant()` (bottom of `semant.cc`, ~line 980).

## The two phases

```
program_class::semant()
 ├─ initialize_constants()             // intern predefined symbols (Object, Int, self, SELF_TYPE...)
 ├─ new ClassTable(classes)            // PHASE 1 — build & validate
 │    ├─ install_basic_classes()       //   Object, IO, Int, Bool, String
 │    ├─ install_user_classes()        //   reject redefinitions of basic/duplicate classes
 │    ├─ check_inheritance_graph()     //   undefined parent, illegal parent, CYCLES, Main exists
 │    └─ build_feature_tables()        //   collect attrs+methods, check override & self rules
 │         (only runs if graph is sound)
 │
 └─ if graph OK: walk classes in topological order  // PHASE 2 — type check
       for each non-basic class:
          enterscope(); push inherited+own attributes; self has type SELF_TYPE
          for each feature: feature->type_check(&env)   // recursive descent over AST
```

## The single most important idea

Every `Expression` subclass implements a **virtual method**:

```cpp
Symbol <node>_class::type_check(TypeEnv *env);
```

It **returns the inferred type** of the expression AND calls `set_type()` on the
node before returning. Type checking is therefore a **recursive tree walk** that
threads a `TypeEnv` (class table + current class + object-id scope) downward and
returns types upward — exactly the inference rules from the Cool manual,
implemented one node at a time.

## Error-recovery rule (know this for the exam)

- **Graph-breaking errors** (undefined/illegal parent, inheritance cycle, redefining a
  basic class) → **fatal**: abort right after `ClassTable` is built,
  because parent-chain walks (`lookup_method`, `conforms`, `lub`) would loop or read garbage.
- **Missing `Main`** is also fatal, but for a different reason: the program has no entry point.
  It does not by itself make `parent_of` unsafe.
- **All other errors** are **recoverable**: the offending node is given type `Object`
  (or another plausible type) and checking continues, so the user sees *every* remaining
  error in one run. This is why `valid_decl` returns `Object` on an undefined type, etc.

## Files that matter for the exam

| File | Role | Modifiable? |
|------|------|-------------|
| `semant.cc` | **All your logic** — ClassTable + every `type_check` | YES (this is the assignment) |
| `semant.h` | Declarations: `ClassTable`, `MethodSig`, `TypeEnv`/`ObjectEnv` typedef | YES |
| `cool-tree.handcode.h` | `_EXTRAS` macros for AST-node additions | YES (additions only) |
| `cool-tree.h` | AST node definitions (fields are `protected`) | look only |
| `good.cl` / `bad.cl` | your legal / illegal test programs | YES |

`type_check(TypeEnv*)` declarations and getters belong in the `_EXTRAS` macros.

## How to run

```sh
make semant
./mysemant good.cl
./mysemant bad.cl
./mysemant -s bad.cl     # -s = semant_debug: dumps ClassTable + inferred types
```

See the other modules:
- `01-data-structures.md` — ClassTable, MethodSig, TypeEnv, ObjectEnv
- `02-inheritance-graph.md` — the phase-1 graph checks
- `03-feature-tables-and-override.md` — attribute/method collection + inheritance rules
- `04-type-checking-rules.md` — every expression's typing rule (the meat)
- `05-selftype-conforms-lub.md` — SELF_TYPE, subtyping, least upper bound
- `06-errors-and-recovery.md` — full error catalogue
- `07-exam-qa.md` — likely questions + short answers
