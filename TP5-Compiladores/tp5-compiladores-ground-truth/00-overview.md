# PA5 — MIPS Code Generation: Overview

> **What PA5 does:** takes the **typed** AST from PA4 and emits MIPS assembly that runs under
> SPIM with the course trap handler (`lib/trap.handler`). All logic is in `PA5/cgen.cc`
> (+ `cgen.h`, `emit.h`).

Entry point: `program_class::cgen(ostream&)` → `new CgenClassTable(classes, os)` → `code()`.

## The pipeline (`CgenClassTable::code()`, ~942)

```
code()
 ├─ assign_class_tags()        // DFS preorder from Object -> contiguous descendant tag ranges
 ├─ compute_layouts()          // per-class: attribute slots + dispatch-table order
 │
 ├─ code_global_data()         // .data header, _int_tag/_bool_tag/_string_tag, .globl decls
 ├─ code_select_gc()           // _MemMgr_INITIALIZER / _COLLECTOR / _TEST  (default NoGC)
 ├─ code_constants()           // str_const*, int_const*, bool_const (true/false)
 ├─ code_class_nameTab()       // tag -> str_const(class name)
 ├─ code_class_objTab()        // tag -> (protObj, init) pair
 ├─ code_dispatch_tables()     // Class_dispTab: slot -> definingClass.method
 ├─ code_prototype_objects()   // Class_protObj: eyecatcher,tag,size,dispTab,default attrs
 │
 ├─ code_global_text()         // .text header, .globl of inits + Main.main
 ├─ code_initializers()        // Class_init for every class
 └─ code_class_methods()       // every user method body
```

## Two segments

- **`.data`** — all the static tables and templates: constants, name/obj tables, dispatch
  tables, prototype objects.
- **`.text`** — executable code: one `Class_init` per class + one label per user method.
  Basic classes' method bodies (`abort`, `copy`, `out_string`, `length`, ...) live in the
  trap handler, so we emit only their dispatch entries and prototypes — never their code.

## The stack-machine convention (the one rule that governs all expression code)

Every `Expression::code(ostream&)` **leaves its result in `$a0` (ACC)**. When a node needs two
subexpressions, it evaluates the first, **pushes** `$a0`, evaluates the second (now in `$a0`),
then **pops** the first into `$t1` to combine. `$t1`/`$t2`/`$t3` hold short-lived values that
don't survive a nested `code()` call.

## Global state shared with expression `code()` methods (cgen.cc ~78)

```cpp
CgenClassTable *g_classtable;   // layouts, tags, lookups
Symbol          g_curr_class;   // class currently being emitted (for filename, SELF_TYPE)
int             g_label_counter;// fresh_label() source for unique labels
int             g_locals_in_method; // current depth of let/case locals
VarEnv         *g_env;          // name -> VarLoc (ATTR/PARAM/LOCAL), refreshed per method
```

## How to run

```sh
gmake cgen
./mycoolc example.cl       # produces example.s
spim -file example.s       # runs it
./mycoolc -c example.cl 2>log   # -c = cgen_debug
```

See the other modules:
- `01-mips-and-registers.md` — registers, emit_* macros, instruction helpers
- `02-object-layout.md` — object header, attribute slots, prototype objects, constants
- `03-tables-and-tags.md` — class tags, nameTab/objTab/dispTab, layout computation
- `04-calling-convention.md` — stack frame, prologue/epilogue, dispatch, new, init
- `05-expression-codegen.md` — code() for every expression
- `06-runtime-checks-and-gc.md` — dispatch/case aborts, equality, GC hooks
- `07-exam-qa.md` — likely questions + answers
