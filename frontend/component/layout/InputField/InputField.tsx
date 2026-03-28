import FieldWrapper from "./FieldWrapper";

type InputFieldProps = {
  label?: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
};

const InputField = ({ label, error, ...props }: InputFieldProps) => {
  return (
    <FieldWrapper label={label} error={error}>
      <input
        {...props}
        className="border rounded px-3 py-2 w-full 
                   focus:outline-none focus:ring-2 focus:ring-primary 
                   disabled:bg-gray-100"
      />
    </FieldWrapper>
  );
};

export default InputField;
