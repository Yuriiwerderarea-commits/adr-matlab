%plot of temperature of object for arbitrary time interval

function plot_object_t(t_start, t_end)
    % Validation
    if ~isnumeric(t_start) || ~isnumeric(t_end)
        error('t_start a t_end musia byt cisla.');
    end
    if t_start < 0 || t_end < 0
        error('t_start a t_end musia byt nezaporne.');
    end
    if mod(t_start, 1) ~= 0 || mod(t_end, 1) ~= 0
        error('t_start a t_end musia byt cele cisla (hodiny).');
    end
    if t_start >= t_end
        error('t_start musi byt mensi ako t_end.');
    end

    [C_val, k] = calculations();
    w = pi / 8;

    t = linspace(t_start, t_end, 1000);
    x = 20 + C_val * exp(-k * t) + k / (k^2 + w^2) * (k * sin(w * t) - w * cos(w * t));

    fig = figure('Visible', 'on');
    ax = axes(fig);
    plot(ax, t, x, 'r-', 'LineWidth', 1.5, 'DisplayName', 'Teplota objektu x(t)');

    xlabel(ax, 'Cas t [hod]');
    ylabel(ax, 'Teplota [°C]');
    title(ax, sprintf('Teplota objektu x(t), t \\in [%d, %d] hod', t_start, t_end));
    legend(ax, 'Location', 'best');
    grid(ax, 'on');
    xlim(ax, [t_start t_end]);

    drawnow;
end