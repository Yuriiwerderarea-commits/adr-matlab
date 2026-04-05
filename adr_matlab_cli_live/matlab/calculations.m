%calculations of c and k
function [C_result, k_result, C_grid, k_grid, residual_grid, residual_fsolve] = calculations()
    w = pi / 8;

    % System of equations
    % f1: C - 5 - (pi/8) / (k^2 + (pi/8)^2) = 0
    % f2: C * e^(-4k) + k^2 / (k^2 + (pi/8)^2) - 3 = 0
    equations = @(x) [
        x(1) - 5 - w / (x(2)^2 + w^2);
        x(1) * exp(-4 * x(2)) + x(2)^2 / (x(2)^2 + w^2) - 3
    ];

    % Grid search
    C_vals = 0:0.1:100;
    k_vals = 0:0.1:100;

    best_residual = inf;
    C_grid = 0;
    k_grid = 0;

    for i = 1:length(C_vals)
        for j = 1:length(k_vals)
            f = equations([C_vals(i), k_vals(j)]);
            residual = sum(f.^2);
            if residual < best_residual
                best_residual = residual;
                C_grid = C_vals(i);
                k_grid = k_vals(j);
            end
        end
    end

    % Residual of grid approximation (ps diff with = 0)
    f_grid = equations([C_grid, k_grid]);
    residual_grid = sqrt(sum(f_grid.^2));

    % fsolve from best initial approximation
    options = optimoptions('fsolve', 'Display', 'off');
    result = fsolve(equations, [C_grid, k_grid], options);
    C_result = result(1);
    k_result = result(2);

    % Residual of fsolve result (ps diff with = 0)
    f_fsolve = equations([C_result, k_result]);
    residual_fsolve = sqrt(sum(f_fsolve.^2));
end