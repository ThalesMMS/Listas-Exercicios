# PA4 — Core Data Structures

These four structures carry all the semantic information. Know what each maps and
who fills/reads it.

## 1. `ClassTable` (semant.h / semant.cc)

The central database, built once in phase 1. Private maps:

```cpp
std::map<Symbol, Class_>                       class_by_name;  // class name -> AST node
std::map<Symbol, Symbol>                        parent_of;      // class name -> parent name
std::map<Symbol, std::map<Symbol, MethodSig> >  methods_of;     // class -> (method name -> signature)
std::map<Symbol, std::map<Symbol, Symbol> >     attrs_of;       // class -> (attr name -> declared type)
```

`Symbol` is `Entry*` (an interned string pointer), so map keys compare by pointer identity —
two `Symbol`s are equal iff they came from the same `idtable.add_string`.

Public queries used by the type checker (the *interface* the rest of the file calls):

| Method | Returns |
|--------|---------|
| `class_exists(name)` | is the class declared? |
| `lookup_class(name)` | the `Class_` AST node (or NULL) |
| `is_subtype(sub, sup)` | `sub <= sup` walking the parent chain (no SELF_TYPE) |
| `conforms(sub, sup, cur)` | subtype check that **understands SELF_TYPE** relative to `cur` |
| `lub(a, b, cur)` | least upper bound (join) of two types in the tree |
| `lookup_method(cls, m)` | `MethodSig*` walking up the chain, or NULL |
| `lookup_attr_type(cls, a)` | declared type of attr, walking up, or NULL |
| `classes_in_order()` | classes in topological (root→leaves) order |
| `semant_error(...)` | 3 overloads; prints `file:line:` prefix, increments `semant_errors` |

> **Design note from the README:** `lookup_method`/`lookup_attr_type` walk *dynamically* up the
> parent chain instead of pre-flattening features into each child. Simpler, and override
> error messages stay at the correct class.

## 2. `MethodSig` (semant.h)

A method's signature — used by both override-checking and dispatch-checking.

```cpp
struct MethodSig {
  std::vector<Symbol> formal_types;  // parameter types, in order
  Symbol              return_type;
  Class_              defining_class; // where it was declared
};
```

## 3. `TypeEnv` (defined in semant.cc, ~line 93)

The bundle passed by pointer to **every** `type_check()`:

```cpp
struct TypeEnv {
    ClassTable *ct;        // the class table (all the global queries)
    Class_      cur_class; // the class being checked: resolves SELF_TYPE + names error file
    ObjectEnv   objs;      // scope of object identifiers (O environment)
};
```

The classic Cool typing judgement is **O, M, C ⊢ e : T**:
- **O** (object env) = `env->objs`
- **M** (method env) = `env->ct->methods()`
- **C** (current class) = `env->cur_class`

## 4. `ObjectEnv` — the scoped symbol table (semant.h)

```cpp
typedef SymbolTable<Symbol, Entry> ObjectEnv;   // name (Symbol) -> declared type (Symbol)
```

**Clever trick:** `Symbol` is already `Entry*`, so the symtab's `DAT*` payload *is* the type
symbol — no wrapper allocation. You store the type with `addid(name, (Entry*) type)` and read
it back with `(Symbol) objs.lookup(name)`.

`enterscope()` / `exitscope()` are called at:
- entry/exit of **each class** (push attributes),
- **method** body (push formals),
- **let** (push the bound id),
- **case** branch (push the branch id).

Inner bindings shadow outer ones (standard scoped lookup), which is exactly Cool's scoping.

## How attributes get into scope: `enter_attribute_scope` (semant.cc ~575)

```cpp
static void enter_attribute_scope(TypeEnv *env, Symbol cls_name) {
    if (cls_name == No_class) return;
    enter_attribute_scope(env, parent);   // RECURSE FIRST -> parent attrs pushed before child's
    for each attr a of cls_name: env->objs.addid(a.name, a.type);
}
```

Recursing to the parent first means **inherited attributes are visible** and a child attr
of the same name would shadow — but PA4 forbids attribute redefinition anyway (see module 03).
