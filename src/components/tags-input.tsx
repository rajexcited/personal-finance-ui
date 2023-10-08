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

    if (!tagsRef.current) {
      return;
    }
    const tagsInput = new BulmaTagsInput(tagsRef.current, options);

    tagsInput.on("after.add", (itemObj: { item: string; }) => {
      // added item 
      console.log(itemObj, tagsInput.value);
      if (props.onChange) {
        // setInputValue(tagsInput.value);
        updateSourceValues(itemObj.item);
        props.onChange(tagsInput.value);
        // sourceValues.push(itemObj.item);
      }
    });
    tagsInput.on("after.remove", (item) => {
      // removed item 
      console.log(item, tagsInput.value);
      if (props.onChange) {
        // setInputValue(tagsInput.value);
        props.onChange(tagsInput.value);
      }
    });

    const updateSourceValues = (item: string) => {
      const sourceValueSet = new Set(props.sourceValues);
      props.defaultValue?.split(",").forEach(value => sourceValueSet.add(value));
      sourceValueSet.add(item);

      sourceValues.length = 0;
      sourceValueSet.forEach(value => sourceValues.push(value));
    };

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
