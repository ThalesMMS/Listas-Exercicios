# PA4 — Likely Exam Questions & Short Answers

## Conceptual

**Q: What are the two phases of semantic analysis here?**
1. Build + validate the inheritance graph and per-class feature tables (`ClassTable` ctor).
2. Topological walk of classes, recursive `type_check` of every feature/expression, decorating
   the AST with `set_type`.

**Q: What does type_check return and what side effect does it have?**
Returns the inferred `Symbol` type and calls `set_type()` on the node. Implements `O,M,C ⊢ e : T`.

**Q: Why must graph errors abort but others continue?**
Cycles/dangling parents make parent-chain walks (`is_subtype`, `lub`, `lookup_method`) loop or
crash. Other errors are local — recover with `Object` and report everything in one run.

**Q: Why a two-pass build_feature_tables?**
Override checking needs *all* classes' features collected first (a class may override a method
from a parent defined later in input). Pass 1 collects; pass 2 cross-references.

**Q: How is `self` typed? Why keep SELF_TYPE symbolic?**
`self : SELF_TYPE`. Kept symbolic so a SELF_TYPE-returning method yields the *caller's* dynamic
type per call site; resolved to `cur_class` only when answering a conformance/lub question.

**Q: State the override rule.**
A subclass may redefine a method only with an **identical** signature (same arity, same formal
types, same return type). Attributes may **not** be redefined at all.

**Q: When does `conforms` return true for sup == SELF_TYPE?**
Only when sub is also SELF_TYPE. Nothing else conforms to SELF_TYPE.

**Q: What is lub and where is it used?**
Least common ancestor in the inheritance tree; used to type `if` (join of branches) and `case`
(join of all branch bodies).

## "Trace the type" drills

**`if x then new Dog else new Cat fi`** (Dog,Cat : Animal) → `lub(Dog,Cat) = Animal`.
**`if b then new Counter else "s" fi`** → `lub(Counter, String) = Object`.
**`(new Dog).set_name("r")`** where `set_name : SELF_TYPE` → receiver `Dog` ⇒ result `Dog`.
**`{ 1; "two"; true; }`** → type of last = `Bool`.
**`x <- 5`** → type is the RHS type `Int` (not declared type of x).
**`let y : Int <- 3 in y + 1`** → `Int`.
**`case o of i:Int=>1; s:String=>2; esac`** → `lub(Int,Int)` ... here both Int ⇒ `Int`
  (with mixed bodies, the join of all branch types).

## "Spot the error" drills

| Snippet | Error |
|---------|-------|
| `class Int inherits IO {...}` | Redefinition of basic class Int (fatal) |
| `class A inherits B {}; class B inherits A {}` | inheritance cycle (fatal) |
| attr `x : Int` in both parent and child | Attribute is an attribute of an inherited class |
| override `foo(a:Int):Int` vs parent `foo():Int` | Incompatible override |
| `self <- 5` | Cannot assign to 'self' |
| `1 + "two"` | non-Int arguments: Int + String |
| `if 5 then ...` | Predicate of 'if' does not have type Bool |
| `5 = "five"` | Illegal comparison with a basic type |
| `e@SELF_TYPE.m()` | Static dispatch to SELF_TYPE is not allowed |
| `let self : Int in ...` | 'self' cannot be bound in a 'let' expression |
| formal `(x : SELF_TYPE)` | Formal parameter x cannot have type SELF_TYPE |

## "Implement / modify" prompts you should be ready for

- **Add a new expression's typing rule** — follow the pattern: type children, check
  constraints (emit `semant_error`), `set_type(result)`, `return result`.
- **Add a check** (e.g. forbid `case` with a single Object branch) — add it inside the relevant
  `type_check` or `build_feature_tables` pass.
- **Explain the ObjectEnv trick** — `Symbol` is `Entry*`, so the symtab's payload *is* the type;
  `addid(name,(Entry*)type)` / `(Symbol)lookup(name)`, no extra allocation.
- **Where would you add multiple inheritance / overloading?** — graph check (allow multiple
  parents) / drop the identical-signature override rule and key methods by name+arity.

## One-line file map
`semant.cc` = ClassTable (phase 1) + all `type_check` (phase 2) + `program_class::semant` driver.
`semant.h` = ClassTable/MethodSig declarations + `ObjectEnv`/`TypeEnv` typedefs.
