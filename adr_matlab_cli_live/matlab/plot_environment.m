%plot of temperatures of environment

function plot_environment()
    t = linspace(0, 24, 1000);
    y = 20 + sin(pi/8 * t);

    fig = figure('Visible', 'on');
    ax = axes(fig);
    plot(ax, t, y, 'b-', 'LineWidth', 1.5, 'DisplayName', 'Teplota prostredia y(t)');
    hold(ax, 'on');

    % Body zo zadania
    t_body = [0, 4, 8, 16];
    y_body = 20 + sin(pi/8 * t_body);

    plot(ax, t_body, y_body, 'ro', 'MarkerSize', 8, 'MarkerFaceColor', 'r', ...
        'DisplayName', 'Body zo zadania');

    hold(ax, 'off');

    xlabel(ax, 'Cas t [hod]');
    ylabel(ax, 'Teplota [°C]');
    title(ax, 'Teplota prostredia y(t) = 20 + sin(\pi/8 \cdot t)');
    legend(ax, 'Location', 'best');
    grid(ax, 'on');
    xlim(ax, [0 24]);

    drawnow;
end