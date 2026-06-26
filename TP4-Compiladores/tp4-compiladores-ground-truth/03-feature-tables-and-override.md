# PA4 — build_feature_tables(): Attributes, Methods & Override Rules

`build_feature_tables()` (`semant.cc` ~274) runs only when the graph is sound. **Two passes.**

## Pass 1 — collect features per class & check local rules

Loop every class, every feature:

### Methods → fill `methods_of[class][name] = MethodSig`
Checks while building the signature:
- **duplicate method in same class** → *"Method m is multiply defined."* (`continue`, keep first)
- per formal:
  - name is `self` → *"'self' cannot be the name of a formal parameter."*
  - **duplicate formal name** in this signature → *"Formal parameter f is multiply defined."*
  - type is `SELF_TYPE` → *"Formal parameter f cannot have type SELF_TYPE."*
  - type undefined → *"Class T of formal parameter f is undefined."*
  - (the formal's declared type is still pushed into `sig.formal_types`)
- return type ≠ `SELF_TYPE` and undefined → *"Undefined return type T in method m."*

### Attributes → fill `attrs_of[class][name] = declared_type`
- name is `self` → *"'self' cannot be the name of an attribute."* (`continue`)
- **duplicate attr in same class** → *"Attribute a is multiply defined in class."* (`continue`)

> Note: at this point only *local* (same-class) duplicates are caught. Inheritance
> rules are pass 2.

## Pass 2 — inheritance rules across classes

For every class, walk **up** the parent chain:

### Attributes may NOT be redefined (even identically)
If any ancestor already has an attribute of the same name:
*"Attribute a is an attribute of an inherited class."*

### Methods may be overridden ONLY with an identical signature
If an ancestor defines the same method name, compare:
- same **number** of formals, AND
- same formal **types** pairwise, AND
- same **return type**.

Any difference → *"Incompatible override of method m in class C."*

```
Cool override rule = invariant (exact) signatures. No covariance,
no contravariance, no changing arity. Same name in a subclass with a
different signature is an error, not an overload.
```

### Main.main() check (end of the function)
If `Main` exists:
- no `main` method → *"No 'main' method in class Main."*
- `main` has ≥1 formal → *"'main' method in class Main should have no arguments."*

## Why two passes?

You can't validate overrides until **every** class's own features are collected — a class may
override a method defined in a parent that appears later in the input. Pass 1 populates the
tables; pass 2 cross-references them.

## Quick reference: which check lives where

| Error | Function |
|-------|----------|
| Redefine basic / duplicate class | `install_user_classes` |
| Undefined / illegal parent, cycle, missing Main | `check_inheritance_graph` |
| self/duplicate/SELF_TYPE formal, dup method, dup attr, bad return type | `build_feature_tables` pass 1 |
| Attr redefinition, incompatible override, Main.main() | `build_feature_tables` pass 2 |
| Everything inside expressions | the `type_check` methods (phase 2) |
