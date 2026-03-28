import FieldWrapper from "./FieldWrapper";

type Option = {
  label: string;
  value: string;
};

type RadioGroupProps = {
  label?: string;
  name: string;
  options: Option[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

const RadioGroup = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
}: RadioGroupProps) => {
  return (
    <FieldWrapper label={label} error={error}>
      <div className="flex gap-4">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="accent-primary"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
    </FieldWrapper>
  );
};

export default RadioGroup;
