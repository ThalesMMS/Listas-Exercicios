# PA5 — Runtime Error Checks & Garbage Collection

## The three checks the code generator must emit

The spec splits runtime errors: **3 are the generator's job**, 3 belong to SPIM/runtime.

### 1. Dispatch on void → `_dispatch_abort`
Before every (static and dynamic) dispatch, after the receiver is in `$a0`:
```
bne $a0 $zero ok
la $a0 str_const<filename>      ; ACC = source file name
li $t1 <line number>            ; T1  = line of the dispatch
jal _dispatch_abort
ok: ... real dispatch ...
```

### 2. Case on void → `_case_abort2`
Same pattern at the top of `typcase_class::code`, before reading the tag.
`_case_abort2` receives filename in ACC, line in T1.

### 3. Case with no matching branch → `_case_abort`
After all branch tag tests fail, restore the scrutinee object into ACC and `jal _case_abort`
(it prints using the object's `type_name`, so no filename/line needed).

### The other three (NOT the generator's job)
- **division by zero**, **substring out of range**, **out of memory (OOM)** — handled by SPIM
  and the runtime/trap handler.

> Mnemonic: *the generator detects the three "void/no-match" structural errors it can see
> statically-shaped; the runtime detects the three value-dependent ones.*

## Garbage collection hooks — `code_select_gc()` (~357) + write barriers

### GC selection (always emitted)
```
_MemMgr_INITIALIZER: .word _NoGC_Init       (or _GenGC_Init / _ScnGC_Init)
_MemMgr_COLLECTOR:   .word _NoGC_Collect     ...
_MemMgr_TEST:        .word <1 if -gtest else 0>
```
`cgen_Memmgr` selects the collector; **default is NoGC**. The runtime reads these three globals to
install the chosen collector.

### Write barriers — `emit_gc_attr_assign(offset)` (~178)
Generational GC needs to know when an old object's field starts pointing at a young object.
So **only when compiled with `-g` (GC_GENGC)**, every write to an **attribute slot** emits:
```
addiu $a1 $s0 offset*4     ; address of the modified slot
jal _GenGC_Assign          ; record it
```
This is emitted from:
- `assign_class::code` (assigning to an attribute), and
- `emit_attr_inits_for` (attribute initializers).

### Why NOT for locals/params?
They live on the **stack**, which the collector already scans as a root set during collection.
Only **heap object fields** need the explicit barrier.

### Why the eye-catcher `-1`?
Every object/constant is preceded by `.word -1`. The GC uses it as a sanity marker to validate it's
looking at a real object header during a heap walk. The standard header (tag/size/dispTab) lets the
collector compute object size and trace pointers.

## Summary table

| Concern | Mechanism | When |
|---------|-----------|------|
| void dispatch | `_dispatch_abort` (file, line) | always, before dispatch |
| void case | `_case_abort2` (file, line) | always, before tag read |
| no case branch | `_case_abort` (object) | always, after tests fail |
| div0 / substr / OOM | SPIM + runtime | not generated |
| GC selection | `_MemMgr_*` globals | always (default NoGC) |
| GC write barrier | `_GenGC_Assign` | only `-g`, only attr writes |
