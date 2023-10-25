import { FunctionComponent, useRef, useEffect, useState } from "react";
import BulmaTagsInput, { BulmaTagsInputOptions } from '@creativebulma/bulma-tagsinput';
import "@creativebulma/bulma-tagsinput/dist/css/bulma-tagsinput.min.css";


export interface TagsInputProps {
  id: string;
  label: string;
  defaultValue?: string;
  sourceValues?: string[];
  placeholder: string;
  onChange?(value: string): void;
}

const defaultOptions = {
  allowDuplicates: false,
  caseSensitive: false,
  clearSelectionOnTyping: false,
  closeDropdownOnItemSelect: true,
  delimiter: ',',
  freeInput: true,
  highlightDuplicate: true,
  highlightMatchesString: true,
  maxChars: 20,
  minChars: 1,
  noResultsLabel: 'No results found',
  removable: true,
  searchMinChars: 1,
  searchOn: 'text',
  selectable: true,
  tagClass: 'is-rounded is-link',
  trim: true,
  itemText: "val"
};

// doc link - https://bulma-tagsinput.netlify.app/get-started/usage/
const TagsInput: FunctionComponent<TagsInputProps> = (props) => {
  const tagsRef = useRef<HTMLInputElement>(null);
  // const [inputValue, setInputValue] = useState(props.defaultValue);

  useEffect(() => {
    const sourceValues: string[] = [];

    const options = {
      ...defaultOptions,
      ...props,
      source: sourceValues
    };

    // this will never happen in useEffect
    if (!tagsRef.current) {
      return;
    }
    const tagsInput = new BulmaTagsInput(tagsRef.current, options);

    tagsInput.on("after.add", (itemObj: { item: string; }) => {
      // added item 
      if (props.onChange) {
        updateSourceValues(itemObj.item);
        props.onChange(tagsInput.value);
      }
    });
    tagsInput.on("after.remove", (item) => {
      // removed item 
      if (props.onChange) {
        props.onChange(tagsInput.value);
      }
    });

    const updateSourceValues = (item: string) => {
      console.log("updateSourceValues, source values", props.sourceValues);
      const sourceValueSet = new Set(props.sourceValues);
      props.defaultValue?.split(",").forEach(value => sourceValueSet.add(value));
      if (!item) sourceValueSet.add(item);

      sourceValues.length = 0;
      sourceValueSet.forEach(value => sourceValues.push(value));
    };

    updateSourceValues("");

    return () => {
      tagsInput.flush();
      tagsInput.destroy();
      document.removeEventListener("click", tagsInput._onDocumentClick);
    };

  }, []);



  return (
    <div className="field">
      <label className="label">{ props.label }</label>
      <div className="control">
        <input ref={ tagsRef }
          type="text"
          placeholder={ props.placeholder }
          className="input is-large"
          data-type="tags"
          defaultValue={ props.defaultValue }
        />
      </div>
    </div>
  );
};

export default TagsInput;
