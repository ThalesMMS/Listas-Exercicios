# PA5 — Object Layout, Prototype Objects & Constants

## The universal object layout

Every Cool object in memory:

```
 word:  -1            <- "eye catcher" (GC sanity check), precedes the object label
 +0     class tag     (TAG_OFFSET)
 +1     size in words (SIZE_OFFSET)  = DEFAULT_OBJFIELDS(3) + #attributes
 +2     dispTab ptr   (DISPTABLE_OFFSET)
 +3     attribute 0
 +4     attribute 1
 ...
```

So attribute *k* lives at word offset `3 + k` from the object pointer. This offset is computed
once per class in `compute_layout_for` and stored in `ClassLayout::attr_offset[name]`.

## Prototype objects — `code_prototype_objects()` (cgen.cc ~650)

For each class, a **template** `Class_protObj` that `new` copies. Emitted with the header above,
then each attribute's **default value by declared type**:

| Attr declared type | Default slot value |
|--------------------|--------------------|
| `Int` | `int_const0` (boxed 0) |
| `Bool` | `bool_const0` (false) |
| `String` | `str_const0` (the empty string) |
| anything else | `0` (= void / null pointer, `EMPTYSLOT`) |

> `new T` = `la $a0 T_protObj; jal Object.copy; jal T_init`. The proto gives a correctly-shaped,
> default-filled object; `copy` clones it; `T_init` runs attribute initializers.

## Constants — `code_constants()` (cgen.cc ~370)

```cpp
stringtable.add_string("");   // ensure empty string exists (used as String default)
inttable.add_int("0");        // ensure 0 exists (Int default)
stringtable.code_string_table(...);
inttable.code_string_table(...);
code_bools(...);
```

Each constant is itself a full boxed object preceded by `-1`:

### String constant — `StringEntry::code_def` (~255)
```
.word -1
str_constN: .word <stringclasstag>
            .word DEFAULT_OBJFIELDS + STRING_SLOTS + (len+4)/4   // size incl. chars
            .word String_dispTab
            .word int_const<len>         // length, as a boxed Int
            .ascii "...\0" ; .align 2
```

### Int constant — `IntEntry::code_def` (~278)
```
.word -1
int_constN: .word <intclasstag> ; .word (3+INT_SLOTS) ; .word Int_dispTab ; .word <value>
```

### Bool constants — `BoolConst::code_def` (~296)
`bool_const0` (false) and `bool_const1` (true), same header + a `.word 0/1` value.
Singletons declared globally: `BoolConst falsebool(FALSE), truebool(TRUE);`.

## Why constants carry a dispTab

So you can dispatch on a literal: `"hi".length()`, `(5).copy()`, `true.type_name()` all need the
String/Int/Bool dispatch table reachable through the object header. (The skeleton omitted this;
the student added the `.word Str_dispTab` etc.)

## Special globals — `code_global_data()` (~313)

Declares `class_nameTab`, the three protObjs needed by the runtime (`Main`, `Int`, `String`),
the two bool constants, and emits the tag words `_int_tag`, `_bool_tag`, `_string_tag`
(the runtime reads these to know which tags are the basic boxed types).
