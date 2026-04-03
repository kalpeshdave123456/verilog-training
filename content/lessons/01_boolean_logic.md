# Boolean Logic and Number Systems

## Why it matters
Every RTL interview starts with logic thinking: truth tables, binary arithmetic, signed vs unsigned, and how synthesis maps logic to gates.

## Verilog view
```verilog
assign y = (a & b) | (~c);
```

## VHDL view
```vhdl
y <= (a AND b) OR (NOT c);
```

## Interview traps
- Confusing bitwise vs logical operators.
- Ignoring signed arithmetic.
- Forgetting operator precedence.

## Checklist
- Explain the idea in one minute.
- Write a minimal code snippet from memory.
- Identify one bug pattern.
- Predict the waveform or output.
