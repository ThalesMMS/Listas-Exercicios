# PA4 — Phase 1: Building & Validating the Inheritance Graph

All in the `ClassTable` constructor (`semant.cc` ~106):

```cpp
ClassTable::ClassTable(Classes classes) {
    install_basic_classes();
    install_user_classes(classes);
    check_inheritance_graph();
    if (semant_errors == 0) build_feature_tables();   // only if graph is sound
    else                    graph_broken = true;
}
```

## install_basic_classes() (~121)

Registers the 5 built-ins with correct parents, by constructing dummy `Class_` AST nodes:

| Class | Parent | Notable features |
|-------|--------|------------------|
| `Object` | `No_class` (root) | `abort() : Object`, `type_name() : String`, `copy() : SELF_TYPE` |
| `IO` | `Object` | `out_string`, `out_int`, `in_string`, `in_int` |
| `Int` | `Object` | attr `val : _prim_slot` |
| `Bool` | `Object` | attr `val : _prim_slot` |
| `String` | `Object` | attrs `val : Int`, `_str_field`; methods `length`, `concat`, `substr` |

`node_lineno = 0` is set first so these dummy nodes report line 0 and never leak into user
error messages. Their bodies are `no_expr()` placeholders — they exist only so lookups succeed.

## install_user_classes() (~197)

Adds each program class to `class_by_name` / `parent_of`, **rejecting**:
- `SELF_TYPE` as a class name → *"Redefinition of basic class SELF_TYPE."*
- redefining `Object`/`IO`/`Int`/`Bool`/`String` → *"Redefinition of basic class X."*
- a name already present → *"Class X was previously defined."*

(`continue` after each error so the bad class isn't installed.)

## check_inheritance_graph() (~219) — three checks, in order

### (a) Every parent is valid
For each `child -> parent`:
- parent is `Int`/`Bool`/`String`/`SELF_TYPE` → *"Class C cannot inherit class P."*
  (helper `descends_from_basic_uninheritable`)
- parent not in `class_by_name` → *"Class C inherits from an undefined class P."*

### (b) No cycles  *(skipped if (a) already errored)*
For each unvisited class, walk **up** the parent chain collecting nodes in a `visiting` set
until reaching `No_class` (clean) or **revisiting a node already in the set** (cycle).
On a cycle, every class in `visiting` gets one message:
*"Class X, or an ancestor of X, is involved in an inheritance cycle."*
An `in_cycle` set prevents re-reporting the same class.

```
Cycle detection = "follow parent pointers; if you loop back to a node you're
currently visiting, the whole walked set is in a cycle."
```

### (c) Main exists  *(skipped if earlier errors)*
`class_by_name.count(Main) == 0` → *"Class Main is not defined."*

## Why graph errors are fatal

If any of the above fires, `build_feature_tables()` is **skipped** and `graph_broken = true`.
Back in `semant()`, `inheritance_graph_broken()` triggers
`"Compilation halted due to static semantic errors."` + `exit(1)`.
Reason: phase-2 lookups (`is_subtype`, `lub`, `lookup_method`) all walk `parent_of`; a cycle or
dangling parent would loop forever or dereference a missing class.

## classes_in_order() (~478) — topological order for phase 2

BFS from `Object` over a child-adjacency map built by inverting `parent_of`. Guarantees a
parent is type-checked (and its attribute scope established) before any child — so attribute
scopes flow root→leaf correctly.
