# PA5 — Expression Code Generation (every node's code())

Reminder: result always lands in `$a0` (ACC). Two-operand nodes push the first, eval the second,
pop the first into `$t1`.

## Leaves

| Node | code() |
|------|--------|
| `int_const` | `la $a0 int_const<k>` (the boxed literal) |
| `string_const` | `la $a0 str_const<k>` |
| `bool_const` | `la $a0 bool_const<0/1>` |
| `no_expr` | `move $a0 $zero` (void) |
| `object` | `self` → `move $a0 $s0`; else load via `VarLoc` (ATTR from `$s0`, PARAM/LOCAL from `$fp`) |

## assign — `assign_class::code` (~1019)
Evaluate RHS → `$a0`; look up name's `VarLoc`; store `$a0` to its location
(ATTR: `sw $a0 off($s0)` + GC barrier; PARAM/LOCAL: `sw $a0 off($fp)`). **Result stays in `$a0`**
(assignment yields the assigned value).

## Arithmetic `+ - * /` — `emit_arith` (~1226)
```
e1->code; push $a0
e2->code
jal Object.copy        ; $a0 = fresh Int (so we never mutate a shared literal)
pop $t1                 ; $t1 = e1 (boxed)
lw $t1 12($t1)          ; unbox e1
lw $t2 12($a0)          ; unbox e2-copy
<op> $t1 $t1 $t2        ; compute
sw $t1 12($a0)          ; rebox into the fresh copy -> result in $a0
```
> The `Object.copy` of e2 is what makes the result a brand-new Int, so literals aren't corrupted.

## neg `~e` (~1245)
`e->code; jal Object.copy; lw $t1 12($a0); neg $t1 $t1; sw $t1 12($a0)`.

## Comparisons `< <=` (~1253, 1266)
Eval both (push/pop), unbox into `$t1`,`$t2`, optimistically load `truebool` into `$a0`,
`blt/ble $t1 $t2 true_lbl`; fall-through loads `falsebool`; `true_lbl:`. **No copy needed**
(result is a Bool constant, not a mutated Int).

## equality `=` — `eq_class::code` (~1279)
Pointer-equal fast path, else runtime helper:
```
e1->code; push; e2->code; move $t2 $a0; pop $t1
la $a0 truebool ; beq $t1 $t2 eq_lbl      ; pointer-equal -> true
la $a1 falsebool ; jal equality_test       ; value compare for Int/Bool/String
eq_lbl:
```
`equality_test` (runtime) returns `$a0` if equal by value, else `$a1`. Convention:
`$t1`=lhs, `$t2`=rhs, `$a0`=true-result, `$a1`=false-result.

## not `not e` — `comp_class::code` (~1297)
`e->code; lw $t1 12($a0)` (unbox Bool); load truebool; `beqz $t1 true_lbl`; else falsebool.

## isvoid (~1318)
`e->code; move $t1 $a0; la $a0 truebool; beqz $t1 true_lbl; la $a0 falsebool; true_lbl:`.

## if — `cond_class::code` (~1094)
```
pred->code; lw $t1 12($a0)        ; unbox the Bool
beqz $t1 else_lbl
then_exp->code; b end_lbl
else_lbl: else_exp->code
end_lbl:
```

## while — `loop_class::code` (~1107)
```
top: pred->code; lw $t1 12($a0); beqz $t1 out
     body->code; b top
out: move $a0 $zero               ; while returns void
```

## block `{ ...; }` (~1120)
Emit each subexpression in order; the last one's result is naturally left in `$a0`.

## let (~1125)
1. Evaluate init (if `no_expr`, load the type's default: int_const0 / falsebool / empty str / void).
2. Reserve a local slot: `g_locals_in_method++`, `off = -g_locals_in_method`, `sw $a0 off($fp)`.
3. `enterscope`; bind id → `VarLoc{LOCAL, off}`; `body->code`; `exitscope`; `g_locals_in_method--`.

## case — `typcase_class::code` (~1152)
```
expr->code
bne $a0 $zero ok      ; void -> _case_abort2(filename, line)
... load filename, line ...
ok: store scrutinee in a local slot; lw $t2 0($a0)   ; $t2 = runtime tag
sort branches by tag DESCENDING (most-specific class wins, since DFS tags grow downward)
for each branch (most specific first):
   for each acceptable descendant tag of branch type: beq $t2 $t3 match
   b next
   match: bind branch var (reuses scrutinee slot) -> code body -> b end
   next:
no branch matched: restore scrutinee -> jal _case_abort
end:
```
> **Why sort by descending tag?** A subclass has a higher tag than its ancestors (DFS preorder),
> so testing higher tags first selects the **closest** matching declared type — Cool's case rule.

## dispatch / static_dispatch / new
See `04-calling-convention.md` (they involve the frame, not just ACC).
