interface DropDownSelectionProps {
  name: string;
  placeholder: string;
  initialSelection?: string;
  options: string[];
}

export default function DropDownSelection({
  name,
  placeholder,
  initialSelection,
  options,
}: DropDownSelectionProps) {
  const lowerCaseName = name.toLowerCase();

  return (
    <>
      <label
        className="block text-sm font-medium text-gray-700 mb-1"
        htmlFor={lowerCaseName}
      >
        {name}
      </label>
      <select
        name={lowerCaseName}
        id={`${lowerCaseName}-select`}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
      >
        {initialSelection ? (
          <option selected>{initialSelection}</option>
        ) : (
          <option selected disabled hidden>
            {placeholder}
          </option>
        )}

        <option value="">None</option>

        {options.map((option) => {
          return (
            <option value={option} id={`${option}-option`}>
              {option}
            </option>
          );
        })}
      </select>
    </>
  );
}
