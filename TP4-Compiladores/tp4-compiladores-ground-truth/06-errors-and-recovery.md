# PA4 — Complete Error Catalogue & Recovery

## Error reporting machinery (semant.cc ~496)

```cpp
ostream& ClassTable::semant_error(Class_ c);                 // uses c's filename + line
ostream& ClassTable::semant_error(Symbol file, tree_node*);  // prints "file:line: "
ostream& ClassTable::semant_error();                         // bumps counter, returns stream
```

Every error: prints `filename:line: <message>` and increments `semant_errors`.
**Do not modify these** (assignment rule). Total count read via `errors()`.

## Two classes of error

### FATAL → abort after phase 1, `exit(1)`
- Redefinition of basic class / SELF_TYPE
- Class previously defined (duplicate)
- Parent undefined
- Parent is Int/Bool/String/SELF_TYPE (illegal inheritance)
- Inheritance cycle
- Main not defined (fatal because there is no entry point, not because parent-chain walks are unsafe)

→ message: `"Compilation halted due to static semantic errors."`
Rationale: graph-breaking errors would make subsequent parent-chain walks loop / read garbage.
Missing `Main` is a separate fatal entry-point error.

### RECOVERABLE → substitute a type, keep checking
Everything else. The node gets `Object` (or a known declared type), so one run surfaces
*all* remaining errors. Recovery types: undefined declared type → `Object`; undeclared
identifier → `Object`; failed dispatch → `Object`.

## Full message list (grouped)

**Class / inheritance (fatal):**
- `Redefinition of basic class SELF_TYPE.`
- `Redefinition of basic class X.`
- `Class X was previously defined.`
- `Class C inherits from an undefined class P.`
- `Class C cannot inherit class P.`
- `Class X, or an ancestor of X, is involved in an inheritance cycle.`
- `Class Main is not defined.`

**Features (recoverable):**
- `'self' cannot be the name of an attribute.`
- `Attribute a is multiply defined in class.`
- `Attribute a is an attribute of an inherited class.`
- `Method m is multiply defined.`
- `'self' cannot be the name of a formal parameter.`
- `Formal parameter f is multiply defined.`
- `Formal parameter f cannot have type SELF_TYPE.`
- `Class T of formal parameter f is undefined.`
- `Undefined return type T in method m.`
- `Incompatible override of method m in class C.`
- `No 'main' method in class Main.`
- `'main' method in class Main should have no arguments.`

**Expressions (recoverable):**
- `Undeclared identifier x.`
- `Cannot assign to 'self'.`
- `Assignment to undeclared variable x.`
- `Type ... of assigned expression does not conform to declared type ... of identifier x.`
- `Dispatch to undefined method m.`
- `Dispatch on undefined class T.`
- `Method m called with wrong number of arguments.`
- `In call of method m, type ... of parameter does not conform to declared type ...`
- `Static dispatch to SELF_TYPE is not allowed.`
- `Static dispatch to undefined class T.`
- `Expression type ... does not conform to declared static dispatch type T.`
- `Predicate of 'if' does not have type Bool.`
- `Loop condition does not have type Bool.`
- `Identifier self cannot be bound in a case branch.`
- `Identifier x declared with type SELF_TYPE in case branch.`
- `Class T of case branch is undefined.`
- `Duplicate branch T in case statement.`
- `'self' cannot be bound in a 'let' expression.`
- `Class T of let-bound identifier is undefined.`
- `Inferred type ... of initialization of x does not conform to identifier's declared type ...`
- `non-Int arguments: t1 OP t2`
- `Argument of '~' has type T instead of Int.`
- `Argument of 'not' has type T instead of Bool.`
- `Illegal comparison with a basic type.`
- `'new' used with undefined class T.`
- `Inferred type ... of initialization of attribute a does not conform to declared type ...`
- `Inferred return type ... of method m does not conform to declared return type ...`

## Testing strategy (from the README)

- `good.cl` exercises legal combos: chained inheritance (Animal→Dog→Poodle), valid override,
  static dispatch to a grandparent, SELF_TYPE return, IO via inheritance, arithmetic,
  `<`/`<=`/`=`, isvoid, if/else LUB resolving to Object, multi-binding let + while,
  multi-branch case, recursion needing lookup_method to walk to own class, chained SELF_TYPE dispatch.
- `bad.cl` exercises **25 distinct errors** in 4 groups (feature decls, override, expressions/dispatch,
  scope) — deliberately **avoiding** graph-breaking errors so the recoverable second phase still runs
  and demonstrates recovery. (Graph-breaking ones are trivial to add and noted in a top comment.)
