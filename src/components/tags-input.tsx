import { FunctionComponent, useRef, useEffect } from "react";
import BulmaTagsInput, { BulmaTagsInputOptions } from '@creativebulma/bulma-tagsinput';
import "@creativebulma/bulma-tagsinput/dist/css/bulma-tagsinput.min.css";


export interface TagsInputProps extends BulmaTagsInputOptions {
  id: string;
  label: string;
  value: string;
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
  trim: true
};


const TagsInput: FunctionComponent<TagsInputProps> = (props) => {
  const tagsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const options = {
      ...defaultOptions,
      ...props,
      source: props.source || props.value || ["neel", "nita", "guddu"]
    };

    if (!tagsRef.current) {
      return;
    }
    const tagsInput = new BulmaTagsInput(tagsRef.current, options);

    tagsInput.on("after.add", (item) => {
      // added item 
      if (props.onChange)
        props.onChange(tagsInput.value);
    });
    tagsInput.on("after.remove", (item) => {
      // removed item 
      if (props.onChange)
        props.onChange(tagsInput.value);
    });

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
        />
      </div>
    </div>
  );
};

export default TagsInput;
