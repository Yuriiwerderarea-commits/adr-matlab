function s = pow10str(x)
if x==0, s='0 × 10^0'; return; end
e = floor(log10(abs(x)));  s = sprintf('%.6f * 10^%d', x/10^e, e);
end