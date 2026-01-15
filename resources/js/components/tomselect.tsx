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

    React.useEffect(() => {
        if (!selectRef.current) return;
        tsRef.current = new TomSelect(selectRef.current, {
            placeholder,
            allowEmptyOption: allowEmpty,
            plugins: ['clear_button'],
            onChange: (val: string) => onChange(val),
        });
        return () => {
            tsRef.current?.destroy();
            tsRef.current = null;
        };
    }, []);

    // Mettre à jour les options quand elles changent
    React.useEffect(() => {
        if (tsRef.current && selectRef.current) {
            // Supprimer toutes les options existantes
            tsRef.current.clearOptions();
            // Ajouter les nouvelles options
            if (allowEmpty) {
                tsRef.current.addOption({ value: '', text: placeholder ?? '—' });
            }
            options.forEach(option => {
                tsRef.current?.addOption({ value: String(option.value), text: option.label });
            });
            // Réinitialiser la valeur si elle n'est plus dans les options
            const currentValue = String(value);
            const optionExists = options.some(o => String(o.value) === currentValue) || (allowEmpty && value === '');
            if (!optionExists && tsRef.current) {
                tsRef.current.setValue('', true);
            }
        }
    }, [options, allowEmpty, placeholder]);

    React.useEffect(() => {
        if (tsRef.current) {
            tsRef.current.setValue(value === '' ? '' : String(value), true);
            if (disabled) {
                tsRef.current.disable();
            } else {
                tsRef.current.enable();
            }
        }
    }, [value, disabled]);

    const baseClasses = 'w-full';
    return (
        <select ref={selectRef} defaultValue={value === '' ? '' : String(value)} disabled={disabled} className={`${baseClasses} ${className}`}>
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


