# PA5 — Likely Exam Questions & Short Answers

## Conceptual

**Q: What are the passes of the code generator?**
(1) Pre-analysis: assign class tags (DFS preorder) + compute per-class layouts (attr slots,
dispatch order). (2) Emit `.data` (constants, nameTab, objTab, dispTabs, protObjs).
(3) Emit `.text` (per-class `_init` + every user method body).

**Q: What is the calling/evaluation convention?**
Stack machine: each `code()` leaves its result in `$a0` (ACC). Two-operand nodes push the first
result, evaluate the second, pop the first into `$t1`. SELF in `$s0` (callee-saved).

**Q: Describe the object layout.**
`[tag][size][dispTab][attr0][attr1]...`, header = 3 words (`DEFAULT_OBJFIELDS`), attribute k at
offset 3+k. Preceded by a `-1` eye-catcher.

**Q: How does dynamic dispatch work and why are overrides correct?**
Method *offset* (slot) is found from the receiver's **static** type's dispatch-table layout; the
actual function pointer is read from the object's **own** dispTab (`lw $t1 8($a0); lw $t1
slot*4($t1); jalr $t1`). Overrides occupy the same slot index, so they dispatch correctly.

**Q: How does `new SELF_TYPE` differ from `new T`?**
`new T` loads the fixed `T_protObj`/`T_init`. `new SELF_TYPE` indexes `class_objTab` by
`2 * self's-runtime-tag` to fetch the *dynamic* class's protObj and init.

**Q: Why DFS-preorder tags?**
A class's descendants get a contiguous tag range and always-higher tags than the class. Makes
case-branch "is this a descendant?" a simple range/tag test, and sorting branches by descending
tag picks the most specific match.

**Q: What does a `Class_init` do?**
Prologue → `jal Parent_init` → run this class's attribute initializers (store into `[SELF+off]`)
→ epilogue returning SELF in ACC.

**Q: Why `Object.copy` before arithmetic?**
Int objects are boxed and shared (literals); copying the operand gives a fresh Int to mutate, so
shared literals aren't corrupted.

**Q: Which runtime errors does the generator emit vs. not?**
Emits: void dispatch (`_dispatch_abort`), void case (`_case_abort2`), no matching case branch
(`_case_abort`). Not emitted (handled by SPIM/runtime): division by zero, substring out of range,
out of memory.

**Q: When are GC write barriers emitted?**
Only with `-g` (generational GC), and only on **attribute** writes (assign + attr init), via
`_GenGC_Assign`. Locals/params live on the stack (already a GC root), so no barrier.

## Stack-frame drills

**Method with 2 formals `(a, b)` — where are they?**
`$fp` offsets: `a` at word 4 (`2-0-1+3`), `b` at word 3 (`2-1-1+3`). Saved old `$fp`/`SELF`/`RA`
at 3/2/1 below — wait: saved regs are at the *low* side; args are *above*. Precisely:
`arg_k` at `(N-k-1)+3`. For N=2: arg0→4, arg1→3.

**Where do let-bound locals live?** `$fp` offsets `0, -1, -2, ...`, reserved up front by
`count_max_locals`.

**What does the epilogue pop?** The 12-byte saved-reg area **plus** `4*nargs` (callee removes the
caller's arguments).

## "What assembly is produced?" drills

**`if cond then A else B fi`:**
```
<cond code>; lw $t1 12($a0); beqz $t1 else
<A>; b end
else: <B>
end:
```

**`x + y` (x,y : Int):** eval x, push; eval y; `jal Object.copy`; pop $t1; unbox both into $t1,$t2;
`add $t1 $t1 $t2`; `sw $t1 12($a0)`.

**`obj.m(arg)`:** eval arg, push; eval obj→$a0; void-check; `lw $t1 8($a0)`; `lw $t1 slot*4($t1)`;
`jalr $t1`.

## "Implement / modify" prompts

- **Add a new operator's code()** — follow `emit_arith`: eval/push/eval, copy, unbox, op, rebox.
- **Add a peephole / range-based case match** — replace the per-tag `beq` chain with a
  `blti/bgti` range test using the contiguous tag interval (README notes this optimization was
  skipped).
- **Explain how method offsets stay stable under override** — `compute_layout_for` overwrites the
  inherited slot in place, preserving its index.
- **Why is SELF callee-saved?** It must survive nested dispatches that overwrite `$a0`; the
  prologue/epilogue save & restore it.

## File map
`cgen.cc` = CgenClassTable (tables/layout/data+text emission) + every expression `code()`.
`cgen.h` = CgenClassTable/CgenNode/ClassLayout/VarLoc + globals. `emit.h` = registers, opcodes,
layout constants, naming macros. `example.cl` = end-to-end test program.
