import * as React from 'react';
import TomSelect from 'tom-select';
import 'tom-select/dist/css/tom-select.css';
import '../../css/tomselect-overrides.css';

type Option = { value: string | number; label: string };

export function TomSelectSingle({ options, value, onChange, placeholder, allowEmpty = false, className = '', disabled = false }: {
    options: Option[];
    value: string | number | '';
    onChange: (val: string) => void;
    placeholder?: string;
    allowEmpty?: boolean;
    className?: string;
    disabled?: boolean;
}) {
    const selectRef = React.useRef<HTMLSelectElement | null>(null);
    const tsRef = React.useRef<TomSelect | null>(null);
    const id = React.useId();

    // Options uniquement au montage (deps [] = options figées au 1er rendu). On ne met jamais à jour
    // les options après, pour éviter que le select du buteur soit touché quand on change le passeur.
    React.useEffect(() => {
        if (!selectRef.current) return;
        const opts = options;
        tsRef.current = new TomSelect(selectRef.current, {
            placeholder,
            allowEmptyOption: allowEmpty,
            plugins: ['clear_button'],
            onChange: (val: string) => onChange(val),
        });
        if (allowEmpty) {
            tsRef.current.addOption({ value: '', text: placeholder ?? '—' });
        }
        opts.forEach((option) => {
            tsRef.current?.addOption({ value: String(option.value), text: option.label });
        });
        const initialVal = value === '' ? '' : String(value);
        if (initialVal && opts.some((o) => String(o.value) === initialVal)) {
            tsRef.current.setValue(initialVal, true);
        }
        return () => {
            tsRef.current?.destroy();
            tsRef.current = null;
        };
        // Intentionnel : options/valeur initiale figées au montage pour éviter effets croisés buteur/passeur
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Synchroniser uniquement la valeur (jamais les options après le montage)
    React.useEffect(() => {
        if (!tsRef.current) return;
        tsRef.current.setValue(value === '' ? '' : String(value), true);
        if (disabled) {
            tsRef.current.disable();
        } else {
            tsRef.current.enable();
        }
    }, [value, disabled]);

    const baseClasses = 'w-full';
    return (
        <select
            id={id}
            ref={selectRef}
            defaultValue={value === '' ? '' : String(value)}
            disabled={disabled}
            className={`${baseClasses} ${className}`}
        >
            {allowEmpty && <option value="">{placeholder ?? '—'}</option>}
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

export function TomSelectMulti({ options, values, onChange, placeholder, className = '' }: {
    options: Option[];
    values: Array<string | number>;
    onChange: (vals: number[]) => void;
    placeholder?: string;
    className?: string;
}) {
    const selectRef = React.useRef<HTMLSelectElement | null>(null);
    const tsRef = React.useRef<TomSelect | null>(null);

    React.useEffect(() => {
        if (!selectRef.current) return;
        tsRef.current = new TomSelect(selectRef.current, {
            placeholder,
            plugins: ['remove_button'],
            onChange: () => {
                const current = (tsRef.current?.items ?? []).map((v) => parseInt(String(v)));
                onChange(current);
            },
        });
        return () => {
            tsRef.current?.destroy();
            tsRef.current = null;
        };
    }, []);

    React.useEffect(() => {
        if (tsRef.current) {
            tsRef.current.setValue(values.map(String), true);
        }
    }, [values]);

    const baseClasses = 'w-full';
    return (
        <select ref={selectRef} defaultValue={values.map(String)} multiple className={`${baseClasses} ${className}`}>
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}


