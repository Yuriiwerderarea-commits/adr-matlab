%plot of temperature of object

function plot_object()
    [C_val, k] = calculations();
    w = pi / 8;

    t = linspace(0, 24, 1000);
    x = 20 + C_val * exp(-k * t) + k / (k^2 + w^2) * (k * sin(w * t) - w * cos(w * t));

    fig = figure('Visible', 'on');
    ax = axes(fig);
    plot(ax, t, x, 'r-', 'LineWidth', 1.5, 'DisplayName', 'Teplota objektu x(t)');
    hold(ax, 'on');

    % Body zo zadania
    t_body = [0, 4];
    x_body = 20 + C_val * exp(-k * t_body) + k / (k^2 + w^2) * (k * sin(w * t_body) - w * cos(w * t_body));

    plot(ax, t_body, x_body, 'ko', 'MarkerSize', 8, 'MarkerFaceColor', 'y', 'DisplayName', 'Body zo zadania');

    hold(ax, 'off');

    xlabel(ax, 'Cas t [hod]');
    ylabel(ax, 'Teplota [°C]');
    title(ax, 'Teplota objektu x(t)');
    legend(ax, 'Location', 'best');
    grid(ax, 'on');
    xlim(ax, [0 24]);

    drawnow;
end