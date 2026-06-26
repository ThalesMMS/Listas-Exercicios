# PA4 — SELF_TYPE, conforms (subtyping) & lub (join)

The trickiest part of Cool's type system. Three functions in `ClassTable` handle it.

## is_subtype(sub, sup) (~418) — plain subtyping, NO SELF_TYPE

Walk up from `sub` through `parent_of`; return true if `sup` is reached.

```cpp
while (sub != No_class) {
    if (sub == sup) return true;
    sub = parent_of[sub];
}
return false;
```

`Object` is the top: everything is a subtype of `Object`. Caller must resolve SELF_TYPE first.

## conforms(sub, sup, cur_class) (~427) — SELF_TYPE-aware `≤`

This is the `≤` used everywhere in the type checker. Rules:

| sub | sup | result |
|-----|-----|--------|
| SELF_TYPE | SELF_TYPE | **true** (SELF_TYPE ≤ SELF_TYPE) |
| anything | SELF_TYPE | **false** — except the case above |
| SELF_TYPE | T (≠SELF_TYPE) | `is_subtype(cur_class, T)` — SELF_TYPE behaves like `cur_class` |
| S | T | `is_subtype(S, T)` |

Key insight (Cool manual rule): **`SELF_TYPE_C ≤ T` iff `C ≤ T`**, and the *only* thing that
conforms to `SELF_TYPE` is `SELF_TYPE` itself. That's why `sup == SELF_TYPE` is almost always false.

## lub(a, b, cur_class) (~434) — least upper bound (the ⊔ / join)

Used by `if` and `case` to combine branch types. Algorithm:
1. If both are SELF_TYPE → SELF_TYPE.
2. Resolve any SELF_TYPE to `cur_class`.
3. Collect all ancestors of `a` (including `a`) into a set.
4. Walk up from `b`; the **first** ancestor of `b` that is also an ancestor of `a` is the lub.
5. Fallback `Object` (always common).

```
lub = "lowest common ancestor in the inheritance tree."
e.g. with Animal -> Dog, Animal -> Cat:  lub(Dog, Cat) = Animal
     unrelated types:                    lub(Counter, String) = Object
```

## How SELF_TYPE flows through the checker (memorize these 5 sites)

1. **`object_class`**: the identifier `self` types as `SELF_TYPE` (stays symbolic).
2. **`new SELF_TYPE`**: result is `SELF_TYPE` (a `new T` of the *current* class).
3. **Dispatch return**: if the method's declared return is `SELF_TYPE`, the call's result is
   the **receiver's** type. So `(new Dog).set_name(...)` where `set_name : SELF_TYPE` returns `Dog`,
   enabling method chaining `(new Counter).inc(10).inc(5)`.
4. **Static dispatch**: `@SELF_TYPE` is **forbidden**.
5. **conforms/lub**: SELF_TYPE is resolved to `cur_class` only at the moment of a subtype/join
   test — never eagerly.

> **Why keep SELF_TYPE symbolic instead of substituting cur_class immediately?**
> Because a method returning SELF_TYPE must yield the *caller's* dynamic type, which differs per
> call site. Resolving early would lose that. You only concretize when you must answer a yes/no
> conformance question or compute a join.

## Helpers in semant.cc

- `valid_decl(env, t, node)` (~559): if `t` is SELF_TYPE keep it; if undefined → error
  *"Class T of identifier is undefined."* + return Object; else return `t`.
- `concretize(t, cur)` (~570): `t == SELF_TYPE ? cur->get_name() : t` — used where a concrete
  class name is required.
