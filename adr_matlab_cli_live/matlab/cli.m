%cli if you choose cli interface
while true
    fprintf('\n=== MENU ===\n');
    fprintf('1 - Vypocet konstant C a k\n');
    fprintf('2 - Graf teploty prostredia\n');
    fprintf('3 - Graf teploty objektu\n');
    fprintf('4 - Graf teploty objektu (vlastny interval)\n');
    fprintf('0 - Koniec\n');
    choice = input('Vyber: ');

    if isempty(choice) || ~isnumeric(choice)
        fprintf('Neplatny vstup. Zadajte cislo.\n');
        continue;
    end

    switch choice
        case 1
            [C_result, k_result, C_grid, k_grid, residual_grid, residual_fsolve] = calculations();

            fprintf('\nNajlepšia aproximácia mriežky:\n');
            fprintf('  C = %g\n', C_grid);
            fprintf('  k = %g\n', k_grid);
            fprintf('  residual = %s\n\n', pow10str(residual_grid));

            fprintf('výsledok riešenia:\n');
            fprintf('  C = %.6f\n', C_result);
            fprintf('  k = %.6f\n', k_result);
            fprintf('  residual = %s\n', pow10str(residual_fsolve));

        case 2
            plot_environment();

        case 3
            plot_object();

        case 4
            t_start = input('t_start [hod]: ');
            if isempty(t_start) || ~isnumeric(t_start)
                fprintf('Chyba: t_start musi byt cislo.\n');
                continue;
            end
            t_end = input('t_end [hod]: ');
            if isempty(t_end) || ~isnumeric(t_end)
                fprintf('Chyba: t_end musi byt cislo.\n');
                continue;
            end
            try
                plot_object_t(t_start, t_end);
            catch err
                fprintf('Chyba: %s\n', err.message);
            end

        case 0
            fprintf('Koniec.\n');
            break;

        otherwise
            fprintf('Neplatna volba.\n');
    end
end
