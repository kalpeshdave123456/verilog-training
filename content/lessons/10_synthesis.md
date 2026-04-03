# Synthesis and Lint Traps

## Why it matters
Synthesis and Lint Traps is frequently asked because it tests both coding style and design intuition.

## Verilog view
```verilog
// minimal synthesizable example
module demo(input clk, input rst_n, input a, output reg y);
always @(posedge clk or negedge rst_n) begin
  if (!rst_n) y <= 1'b0;
  else y <= a;
end
endmodule
```

## VHDL view
```vhdl
entity demo is
  Port ( clk : in STD_LOGIC; rst_n : in STD_LOGIC; a : in STD_LOGIC; y : out STD_LOGIC );
end demo;

architecture rtl of demo is begin
  process(clk, rst_n) begin
    if rst_n = '0' then
      y <= '0';
    elsif rising_edge(clk) then
      y <= a;
    end if;
  end process;
end rtl;
```

## Interview traps
- Not stating synthesizable intent clearly.
- Failing to reason about timing or reset behavior.
- Forgetting edge cases in interview follow-ups.

## Checklist
- Explain the idea in one minute.
- Write a minimal code snippet from memory.
- Identify one bug pattern.
- Predict the waveform or output.
