# Sequential Design and Registers

## Why it matters
Registers, flops, enables, and resets are the backbone of synthesizable RTL.

## Verilog view
```verilog
always @(posedge clk or negedge rst_n) begin
  if (!rst_n) q <= 0;
  else if (en) q <= d;
end
```

## VHDL view
```vhdl
process(clk, rst_n) begin
  if rst_n = '0' then
    q <= (others => '0');
  elsif rising_edge(clk) then
    if en = '1' then
      q <= d;
    end if;
  end if;
end process;
```

## Interview traps
- Mixing combinational and sequential intent.
- Using blocking assignments inside clocked logic.
- Forgetting reset polarity.

## Checklist
- Explain the idea in one minute.
- Write a minimal code snippet from memory.
- Identify one bug pattern.
- Predict the waveform or output.
