import { Trash2 } from "lucide-react";

interface DropDownMultiSelectProps {
  name: string;
  placeholder: string;
  options: string[];
  selection: string[];
  setSelection: any;
}

export default function OnChangeDropDownMultiSelect({
  name,
  placeholder,
  options,
  selection,
  setSelection,
}: DropDownMultiSelectProps) {
  const lowerCaseName = name.toLowerCase();

  const addSelection = (addition: string) => {
    if (!addition) {
      return;
    }

    if (selection.includes(addition)) {
      console.log("Item already Included.");
      return;
    }

    const newSelection = [addition, ...selection];
    setSelection(newSelection);
  };

  const deleteSelection = (omission: string) => {
    const newSelection = selection.filter((item) => item !== omission);

    setSelection(newSelection);
  };

  const updateSelection = (currentItem: string, replacementItem: string) => {
    if (selection.includes(replacementItem)) {
      console.log("Item already Included.");
      return;
    }

    if (!replacementItem) {
      deleteSelection(currentItem);
      return;
    }

    const newSelection = selection.map((item) =>
      item === currentItem ? replacementItem : item
    );

    setSelection(newSelection);
  };

  return (
    <>
      <label
        className="block text-sm font-medium text-gray-700 mb-1"
        htmlFor={lowerCaseName}
      >
        {name}
      </label>

      <div className="flex items-center space-x-2">
        <select
          name={lowerCaseName}
          id={`${lowerCaseName}-select`}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
          onChange={(event: any) => {
            addSelection(event.target.value);
            event.target.value = "";
          }}
        >
          <option selected value="">
            {placeholder}
          </option>

          {/* all option components*/}
          {options.map((option) => {
            const isSelected = selection.includes(option);
            return (
              <option
                value={option}
                id={`${option}-option`}
                disabled={isSelected}
                style={isSelected ? { color: "gray" } : {}}
              >
                {option}
              </option>
            );
          })}
        </select>
      </div>

      <ul>
        {selection.map((item) => {
          return (
            <li
              key={`${item}-${name}`}
              id={`${lowerCaseName}-${item}`}
              className="flex items-center justify-between"
            >
              <select
                name={`${item}-${lowerCaseName}`}
                id={`${item}-${lowerCaseName}`}
                onChange={(event: any) => {
                  updateSelection(item, event.target.value);
                }}
                className=" bg-white border border-gray-200 rounded-lg p-3 shadow-sm m-2 w-full"
              >
                <option selected value={item}>
                  {item}
                </option>

                {options.map((option) => {
                  const isSelected = selection.includes(option);
                  return (
                    <option
                      value={option}
                      id={`${option}-option`}
                      disabled={isSelected}
                      style={isSelected ? { color: "gray" } : {}}
                    >
                      {option}
                    </option>
                  );
                })}
                <span className="text-gray-800">{item}</span>
                <button
                  onClick={() => {
                    deleteSelection(item);
                  }}
                  className="text-gray-400 hover:text-red-500 focus:outline-none focus:text-red-500 transition-colors duration-200"
                  aria-label={`remove ${item}`}
                  id={`remove-${item}`}
                >
                  <Trash2 />
                </button>
              </select>
              <button
                onClick={() => {
                  deleteSelection(item);
                }}
                className="text-gray-400 hover:text-red-500 focus:outline-none focus:text-red-500 transition-colors duration-200"
                aria-label={`remove ${item}`}
                id={`remove-${item}`}
              >
                <Trash2 />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
