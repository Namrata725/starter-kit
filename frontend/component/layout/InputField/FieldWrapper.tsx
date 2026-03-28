type FieldWrapperProps = {
  label?: string;
  error?: string;
  children: React.ReactNode;
};

const FieldWrapper = ({ label, error, children }: FieldWrapperProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      {children}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default FieldWrapper;
