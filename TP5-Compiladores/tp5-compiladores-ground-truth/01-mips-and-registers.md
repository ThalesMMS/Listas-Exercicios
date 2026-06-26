# PA5 — MIPS Registers, Macros & emit_* Helpers

## Registers (defined in emit.h)

| Macro | Reg | Role |
|-------|-----|------|
| `ZERO` | `$zero` | constant 0 |
| `ACC` | `$a0` | **accumulator** — every expression leaves its result here |
| `A1` | `$a1` | 2nd argument to runtime primitives (e.g. `equality_test`) |
| `SELF` | `$s0` | pointer to `self` (callee-saved) |
| `T1`,`T2`,`T3` | `$t1..$t3` | temporaries (don't survive nested `code()`) |
| `SP` | `$sp` | stack pointer (grows **down**, toward smaller addresses) |
| `FP` | `$fp` | frame pointer (fixed base for args/locals during a call) |
| `RA` | `$ra` | return address |

## Object-header constants (emit.h)

```
DEFAULT_OBJFIELDS = 3      // every object starts with 3 header words
TAG_OFFSET       = 0       // class tag
SIZE_OFFSET      = 1       // size in words
DISPTABLE_OFFSET = 2       // pointer to dispatch table
                           // attributes start at word 3
WORD_SIZE = 4   LOG_WORD_SIZE = 2
```

## Naming conventions (emit.h) — what labels look like in the .s

| Suffix/macro | Example | Meaning |
|--------------|---------|---------|
| `DISPTAB_SUFFIX` `_dispTab` | `Dog_dispTab` | dispatch table |
| `CLASSINIT_SUFFIX` `_init` | `Dog_init` | initializer |
| `PROTOBJ_SUFFIX` `_protObj` | `Dog_protObj` | prototype object |
| `METHOD_SEP` `.` | `Dog.describe` | method entry point |
| `INTCONST_PREFIX` | `int_const3` | boxed Int constant |
| `STRCONST_PREFIX` | `str_const5` | String constant |
| `BOOLCONST_PREFIX` | `bool_const0/1` | Bool constants (false/true) |

## emit_* helpers (cgen.cc ~115–238) — your assembly "API"

These are thin wrappers that print one MIPS instruction. Grouped:

**Load/store/move:** `emit_load(dst,off,src)` → `lw dst off*4(src)`;
`emit_store(src,off,dst)` → `sw`; `emit_load_imm` → `li`; `emit_load_address`/`emit_partial_load_address` → `la`;
`emit_move`.

**Arithmetic:** `emit_add/addu/addiu/sub/mul/div/neg/sll`.

**Branches:** `emit_beqz`, `emit_beq`, `emit_bne`, `emit_bleq` (ble), `emit_blt`, `emit_branch` (unconditional `b`).

**Calls/return:** `emit_jal label`, `emit_jalr $reg` (indirect — used by dispatch), `emit_return` (`jr $ra`).

**Stack (the push/pop idiom):**
```cpp
emit_push(reg):  sw reg 0($sp);  addiu $sp $sp -4   // store THEN move down
emit_pop(reg):   addiu $sp $sp 4;  lw reg 0($sp)    // move up THEN load
```

**Boxed-Int access (the value of an Int/Bool is at offset 3 = DEFAULT_OBJFIELDS):**
```cpp
emit_fetch_int(dst, src):  lw dst 12(src)   // read the unboxed value
emit_store_int(src, dst):  sw src 12(dst)   // write the unboxed value
```

**Reference emitters (write a label name, no instruction):** `emit_disptable_ref`,
`emit_init_ref`, `emit_protobj_ref`, `emit_method_ref`, `emit_label_ref/def`.

> **Why `emit_fetch_int` at offset 3?** Int/Bool/String are *boxed*: an `Int` object is
> `[tag][size][dispTab][value]`. Arithmetic must unbox (read word 3), compute, and rebox.
