# PA5 — Calling Convention, Stack Frame, Dispatch, new & init

This is the highest-yield exam topic. Memorize the frame diagram.

## The stack frame (offsets from `$fp`)

The caller pushes arguments **left-to-right**. The callee prologue saves 3 registers and sets
`$fp = $sp + 4`. Resulting layout (offsets in **words** from `$fp`):

```
 higher addresses
   ...
   N+2   arg_0          <- first argument (pushed first = deepest)
   N+1   arg_1
   ...
    3    arg_{N-1}       <- last argument
    2    saved old $fp
    1    saved old $s0 (SELF)
    0    saved old $ra        <-- wait: see offsets below
 lower addresses
```

The code in `emit_method_prologue` (cgen.cc ~687):
```cpp
addiu $sp $sp -12        // reserve 3 words
sw $fp 12($sp)           // store at offset 3
sw $s0 8($sp)            // store at offset 2  (SELF)
sw $ra 4($sp)            // store at offset 1  (RA)
addiu $fp $sp 4          // $fp points just below the saved regs
move $s0 $a0             // SELF <- receiver (passed in ACC)
```
After this, from `$fp`: **3 = old $fp, 2 = old SELF, 1 = old RA**, and arguments are *above*
that. For N formals: `arg_k` is at word offset **`(N - k - 1) + 3`** (so `arg_0` → `N+2`,
`arg_{N-1}` → `3`). This exact formula is in `code_class_methods` (~921).

## Locals (let / case bindings)

Allocated **below** the saved registers, at `$fp` offsets `0, -1, -2, ...` (word units).
`count_max_locals` (~808) statically computes the **maximum simultaneous local depth** so the
prologue reserves all the space at once with `addiu $sp $sp -4*n_locals`:
- siblings (if/case branches, block stmts, binary operands) **reuse** slots → take the `max`.
- a `let` adds 1 to whatever its body needs → `1 + max(init, body)`.
- a `case` branch adds 1 (its bound var) → `1 + body`.

## Epilogue — `emit_method_epilogue(nargs)` (~700)

```cpp
lw $fp 12($sp) ; lw $s0 8($sp) ; lw $ra 4($sp)   // restore saved regs
addiu $sp $sp 12 + 4*nargs                        // pop frame AND the caller's args
jr $ra
```
**The callee tears down the arguments** (matches coolc's convention). Result is already in ACC.

## VarLoc — how names resolve to addresses (cgen.h ~132)

```cpp
struct VarLoc { enum { ATTR, PARAM, LOCAL } kind; int offset; };
```
- `ATTR` → `lw/sw $a0 offset($s0)` (offset within self, 3+)
- `PARAM` → `lw/sw $a0 offset($fp)` (positive offset, computed above)
- `LOCAL` → `lw/sw $a0 offset($fp)` (zero/negative offset)

`g_env` is rebuilt per method: attributes added first, then formals.

## Dynamic dispatch — `dispatch_class::code` (~1043)

`e.m(a1,...,an)`:
1. Evaluate each actual **left-to-right**, push each (`emit_dispatch_args`).
2. Evaluate receiver `e` → `$a0`.
3. **Void check:** `bne $a0 $zero label`; if void, load filename into ACC + line into T1,
   `jal _dispatch_abort`.
4. Resolve the method **slot** using `e`'s *static* type's layout (`L.method_offset[name]`);
   SELF_TYPE → current class.
5. `lw $t1 8($a0)` (dispTab), `lw $t1 (slot*4)($t1)` (method ptr), `jalr $t1`.

> Dispatch uses the **static** type only to find the *offset*; the *actual* method comes from the
> object's own dispTab at runtime — that's how overrides dispatch correctly.

## Static dispatch — `static_dispatch_class::code` (~1069)

Same, but the dispatch table is loaded from a **fixed label** `Type_dispTab` (the `@Type`
annotation), not from the object header. Slot still via `Type`'s layout.

## new — `emit_new` (~984)

- `new T` (concrete): `la $a0 T_protObj; jal Object.copy; jal T_init`.
- `new SELF_TYPE`: must use the **runtime** type. Index `class_objTab` by `2 * self_tag`:
  load `class_objTab`, read self's tag (`lw 0($s0)`), `sll *8` (two words per entry), add;
  word 0 = protObj (→ `jal Object.copy`), word 1 = init (→ `jalr`).

## Class initializers — `code_initializers()` (~731)

`Class_init`:
1. standard prologue;
2. `jal Parent_init` (so inherited attrs are initialized first);
3. for each attr with a non-`no_expr` init: evaluate it, `sw $a0 offset($s0)`
   (+ GC write barrier — see module 06);
4. epilogue returning **SELF in ACC** (the init convention).

The variable env during an init contains **only attributes** (no formals); `let`/`case` locals
inside an initializer use the init's own frame, just like a method.
