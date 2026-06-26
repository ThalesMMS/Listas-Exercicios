# PA4 — The Type-Checking Rules (Phase 2)

This is the core of the exam. Each `Expression` node's `type_check(env)` returns its
inferred type and calls `set_type()`. Below: every node, its rule, and its error(s).
Notation: `O ⊢ e : T` means "e has type T". `≤` = conforms (SELF_TYPE-aware).

## Feature checkers (drive the expression checkers)

### `attr_class::type_check` (~591)
- `declared = valid_decl(type_decl)` (→ Object if undefined)
- if there is an init expr: `init_t = init->type_check()`; require `init_t ≤ declared`
  else error *"Inferred type ... of initialization of attribute a does not conform to declared type ..."*
- if no init: `init->set_type(No_type)`.

### `method_class::type_check` (~615)
- `enterscope()`; bind each formal `name -> type` (recover SELF_TYPE/undefined → Object;
  skip self/duplicate formals already reported).
- `body_t = expr->type_check()`; require `body_t ≤ return_type`
  else *"Inferred return type ... of method m does not conform to declared return type ..."*
- `exitscope()`.

## Constants & identifiers

| Node | Rule | Notes |
|------|------|-------|
| `int_const` | `: Int` | |
| `bool_const` | `: Bool` | |
| `string_const` | `: String` | |
| `no_expr` | `: No_type` | the "empty" init |
| `object` (id) | look up in `O`; `: that type` | `self` → **SELF_TYPE**; undeclared → error *"Undeclared identifier x."*, recover Object |

## Assignment — `assign_class` (~661)
`id <- e`:
1. `id == self` → *"Cannot assign to 'self.'"*
2. `declared = O.lookup(id)`; NULL → *"Assignment to undeclared variable id."*
3. `rhs = e->type_check()`; require `rhs ≤ declared` else
   *"Type ... of assigned expression does not conform to declared type ... of identifier id."*
4. **result type = `rhs`** (the type of the RHS, not the declared type).

## Dispatch — the two hardest

Shared helper `type_check_dispatch_common` (~687):
- `sig = lookup_method(class_for_lookup, name)`; NULL → *"Dispatch to undefined method m."* → Object
- arg count ≠ formal count → *"Method m called with wrong number of arguments."*
- per arg: `at = actual->type_check()`; require `at ≤ formal_types[i]` else
  *"In call of method m, type ... of parameter does not conform to declared type ..."*
- **return:** if `sig.return_type == SELF_TYPE` return the **receiver's** type (preserves
  SELF_TYPE through the call); else the declared return type.

### `dispatch_class` — `e.m(args)` (~723)
- `recv_t = e->type_check()`; resolve SELF_TYPE → current class for the lookup.
- receiver class not found → *"Dispatch on undefined class T."* → Object.
- delegate to the common helper with `lookup_in = recv_t`.

### `static_dispatch_class` — `e@Type.m(args)` (~737)
- `recv_t = e->type_check()`.
- `Type == SELF_TYPE` → *"Static dispatch to SELF_TYPE is not allowed."*
- `Type` undefined → *"Static dispatch to undefined class T."*
- require `recv_t ≤ Type` else *"Expression type ... does not conform to declared static dispatch type T."*
- look the method up **in `Type`** (the @-annotated class), not the runtime type.

## Control flow

### `cond_class` — `if p then a else b fi` (~761)
- `p` must be `Bool` else *"Predicate of 'if' does not have type Bool."*
- result = **`lub(then_t, else_t)`**.

### `loop_class` — `while p loop b pool` (~774)
- `p` must be `Bool` else *"Loop condition does not have type Bool."*
- body checked; **result type is always `Object`** (a while returns void/Object).

### `block_class` — `{ e1; e2; ...; en; }` (~819)
- check all; **result = type of the last expression**.

### `typcase_class` — `case e of x:T => e' ... esac` (~785)
- check `e` (its value is only used for the runtime tag).
- per branch:
  - branch identifier is `self` → error; do **not** bind `self` in the branch scope.
  - declared `SELF_TYPE` → *"Identifier x declared with type SELF_TYPE in case branch."*
  - declared type undefined → *"Class T of case branch is undefined."*
  - **duplicate branch type** → *"Duplicate branch T in case statement."*
  - `enterscope()`; bind `x -> T`; check branch body; `exitscope()`.
- result = **lub of all branch body types**.

### `let_class` — `let x:T <- init in body` (~828)
- `x == self` → *"'self' cannot be bound in a 'let' expression."*
- `T` undefined → *"Class T of let-bound identifier is undefined."* (recover Object)
- if init present: require `init_t ≤ T` else *"Inferred type ... of initialization of x does not conform..."*
- `enterscope()`; bind `x -> T` (unless self); `body_t = body->type_check()`; `exitscope()`.
- result = `body_t`.

## Operators

### Arithmetic `+ - * /` — helper `check_arith` (~858)
- both operands must be `Int`, else *"non-Int arguments: t1 OP t2"*. Result `: Int`.

### `neg_class` — `~e` (~874)
- `e` must be `Int` else *"Argument of '~' has type T instead of Int."* Result `: Int`.

### Relational `< <=` (~884, ~891)
- reuse `check_arith` (operands must be Int) but **result is `Bool`**.

### Equality `=` — `eq_class` (~898)
- if **either** side is a basic type (Int/Bool/String) and the two types differ →
  *"Illegal comparison with a basic type."* Result `: Bool`.
  (Two non-basic objects, or two of the same basic type, are fine — compared by pointer at runtime.)

### `comp_class` — `not e` (~911)
- `e` must be `Bool` else *"Argument of 'not' has type T instead of Bool."* Result `: Bool`.

## Object creation / misc

### `new__class` — `new T` (~925)
- `T == SELF_TYPE` → result **SELF_TYPE**.
- else `T` undefined → *"'new' used with undefined class T."* → Object; else result `: T`.

### `isvoid_class` — `isvoid e` (~936)
- check `e` (any type); result `: Bool`.

> **Pattern to memorize:** every checker (1) recursively types its children, (2) applies
> the rule's constraints emitting errors, (3) `set_type(result)`, (4) `return result`.
> Errors never throw — they print and substitute a recovery type so the walk continues.
