# PA5 — Class Tags, Layouts & the Code Tables

## Class tags — `assign_class_tags()` / `dfs_assign_tags` (cgen.cc ~516)

Tags are assigned by **DFS preorder starting at `Object`**. The result:

```
Object = 0, then its first child gets 1, that child's subtree, ... (preorder)
```

**Key property:** a class's descendants form a **contiguous range of tags** `[tag, tag+subtreeSize)`.
A class always has a *lower* tag than its descendants and a *higher* tag than its ancestors.
This makes case-branch matching easy (descendant = "tag in my subtree range").

Side effect: `stringclasstag`, `intclasstag`, `boolclasstag` are read off here for the runtime.
`class_by_tag[t]` gives the node for tag `t`; `class_tag[name]` the reverse.

## Per-class layout — `compute_layout_for` (~547), stored in `ClassLayout` (cgen.h)

Recursive top-down (root first). Each class **inherits its parent's layout**, then appends its own
features:

```cpp
struct ClassLayout {
   vector<attr_class*> attr_order;          // attrs in slot order (inherited first)
   vector<Symbol>      attr_defining_class;
   map<Symbol,int>     attr_offset;         // attr name -> word offset (3, 4, ...)
   map<Symbol,Symbol>  attr_type;

   vector<method_class*> method_order;      // dispatch table order
   vector<Symbol>        method_defining_class;
   map<Symbol,int>       method_offset;     // method name -> slot (0, 1, ...)
};
```

- **Attribute** → new slot at `DEFAULT_OBJFIELDS + attr_order.size()`.
- **Method, new name** → appended to the dispatch table at the next slot.
- **Method, overriding name** → **replaces the slot in place**, keeping the same offset, but
  records the new `defining_class`. → all callers index the same slot regardless of who implements it.

```
Inheritance of layout = "copy parent's vectors/maps, then append my own
features; overrides overwrite the inherited slot but keep its index."
```

## The four data tables

### class_nameTab — `code_class_nameTab()` (~616)
Array indexed by tag; entry `t` = pointer to `str_const` of the class name.
Used by `Object.type_name` and by abort messages.

### class_objTab — `code_class_objTab()` (~626)
Array indexed by tag; **two words per class**: `Class_protObj` then `Class_init`.
Used by `new SELF_TYPE` (index = `2 * dynamic_tag`).

### Class_dispTab — `code_dispatch_tables()` (~636)
For each class, one word per method slot = `<definingClass>.<method>`. The slot order is the
`method_order` computed above. **Dispatch = `lw $t1 8($a0); lw $t1 (slot*4)($t1); jalr $t1`.**

### Class_protObj — see `02-object-layout.md`.

## tag_descendants_inclusive(Symbol) (~594)

Returns the tags of a class and all its descendants (DFS over `children`). Used by `case` to test
"is the runtime tag one of the acceptable types for this branch?" (The README notes the contiguous-
range optimization—`low <= tag <= high`—was left as explicit list-matching for simplicity.)

## CgenNode & the inheritance tree (~462–502)

`install_class` adds nodes to `nds` and the symbol table; `build_inheritance_tree`/`set_relations`
wire each node's `parentnd` and push it onto the parent's `children` (front-insertion, so DFS
reverses to recover source order). `CgenNode : public class__class` — a class AST node augmented
with parent/children pointers and a `basic()` flag.
