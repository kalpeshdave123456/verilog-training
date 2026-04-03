# Combinational Design Patterns

## Why it matters
Muxes, decoders, encoders, comparators, and priority logic appear everywhere in digital design.

## Verilog view
```verilog
always @(*) begin
  case (sel)
    2'b00: y = a;
    2'b01: y = b;
    2'b10: y = c;
    default: y = d;
  endcase
end
```

## VHDL view
```vhdl
process(all) begin
  case sel is
    when "00" => y <= a;
    when "01" => y <= b;
    when "10" => y <= c;
    when others => y <= d;
  end case;
end process;
```

## Interview traps
- Missing default path causing latch inference.
- Using incomplete sensitivity lists in old-style Verilog.
- Confusing priority encoder vs plain encoder.

## Checklist
- Explain the idea in one minute.
- Write a minimal code snippet from memory.
- Identify one bug pattern.
- Predict the waveform or output.
