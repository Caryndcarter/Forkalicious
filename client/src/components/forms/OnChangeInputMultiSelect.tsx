import { Trash2 } from "lucide-react";

interface InputMultiSelectProps {
  name: string;
  placeholder: string;
  selection: string[];
  setSelection: any;
}

export default function OnChangeInputMultiSelect({
  name,
  placeholder,
  selection,
  setSelection,
}: InputMultiSelectProps) {
  const lowerCaseName = name.toLowerCase();

  const addSelection = (addition: string) => {
    if (!addition) {
      return;
    }

    if (selection.includes(addition)) {
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

  const inputListener = (event: any, func: any, args: any[]) => {
    if (event.key === "Escape") {
      event.target.value = "";
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      func(...args);
      event.target.value = "";
    }
    return;
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
        <input
          type="text"
          name={lowerCaseName}
          id={`${lowerCaseName}-select`}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
          placeholder={placeholder}
          onBlur={(event: any) => {
            addSelection(event.target.value);
            event.target.value = "";
          }}
          onKeyDown={(event: any) => {
            inputListener(event, addSelection, [event.target.value]);
          }}
        />
      </div>

      <ul>
        {selection.map((item) => {
          return (
            <li
              key={`${item}-${name}`}
              id={`${lowerCaseName}-${item}`}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-sm m-2"
            >
              <input
                name={`${item}-${lowerCaseName}`}
                id={`${item}-${lowerCaseName}`}
                type="text"
                className="text-gray-800"
                defaultValue={item}
                onBlur={(event: any) => {
                  updateSelection(item, event.target.value);
                }}
                onKeyDown={(event: any) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    updateSelection(item, event.target.value);
                  }
                }}
              />
              <button
                onClick={() => {
                  deleteSelection(item);
                }}
                className="text-gray-400 hover:text-red-500 focus:outline-none focus:text-red-500 transition-colors duration-200"
                aria-label={`remove-${item}`}
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
