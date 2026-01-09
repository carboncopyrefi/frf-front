import { useState, useEffect } from 'react';

export function Autocomplete({
  loading,
  options,
  value,
  onChange,
  placeholder,
}: {
  loading?: boolean;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (opt: { value: string; label: string } | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value || ''); // ← start with parent value

  // keep input in sync when parent changes (back/forward)
  useEffect(() => {
    setInput(value || '');
  }, [value]);

  const matches = options.filter((o) =>
    o.label.toLowerCase().includes(input.toLowerCase())
  );

  if (loading)
    return <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />;

  return (
    <div className="relative w-full">
      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
          onChange(null); // clear while typing
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder={placeholder}
      />

      {open && matches.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow">
          {matches.map((o) => (
            <li
              key={o.value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setInput(o.label);
                setOpen(false);
                onChange(o);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

