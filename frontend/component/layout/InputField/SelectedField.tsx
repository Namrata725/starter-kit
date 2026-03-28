import FieldWrapper from "./FieldWrapper";

type Option = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label?: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  error?: string;
  disabled?: boolean;
};

const SelectField = ({ label, error, options, ...props }: SelectFieldProps) => {
  return (
    <FieldWrapper label={label} error={error}>
      <select
        {...props}
        className="border rounded px-3 py-2 w-full 
                   focus:outline-none focus:ring-2 focus:ring-primary 
                   disabled:bg-gray-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
};

export default SelectField;
