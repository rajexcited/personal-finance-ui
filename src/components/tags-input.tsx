import "./tags-input.css";
import { FunctionComponent, useRef, useEffect, useState } from "react";
import BulmaTagsInput, { BulmaTagsInputOptions } from '@creativebulma/bulma-tagsinput';
import "@creativebulma/bulma-tagsinput/dist/css/bulma-tagsinput.min.css";
import { getLogger } from "../shared";


export interface TagsInputProps {
  id: string;
  label: string;
  defaultValue: string[];
  sourceValues: string[];
  placeholder: string;
  maxTags?: number;
  onChange?(value: string[]): void;
}

const defaultOptions: BulmaTagsInputOptions = {
  allowDuplicates: false,
  caseSensitive: false,
  clearSelectionOnTyping: false,
  closeDropdownOnItemSelect: true,
  delimiter: ',',
  freeInput: true,
  highlightDuplicate: true,
  highlightMatchesString: true,
  maxChars: 15,
  minChars: 2,
  noResultsLabel: 'No results found',
  removable: true,
  searchMinChars: 1,
  searchOn: 'text',
  selectable: true,
  tagClass: 'is-rounded is-link',
  trim: true,
  itemText: "val",
  maxTags: 10,
};

/**
 * doc link - https://bulma-tagsinput.netlify.app/get-started/usage/
 * https://wikiki.github.io/
 * 
 **/
const fcLogger = getLogger("FC.TagsInput", null, null, "DISABLED");

const TagsInput: FunctionComponent<TagsInputProps> = (props) => {
  const tagsRef = useRef<HTMLInputElement>(null);
  const [tagCount, setTagCount] = useState(0);

  useEffect(() => {
    const logger = getLogger("useEffect.dep[tagsRef.current]", fcLogger);
    logger.debug("tagsRef.current =", tagsRef.current);
    // this will never happen in useEffect
    if (!tagsRef.current) {
      return;
    }
    const sourceValues: string[] = [];

    const options = {
      ...defaultOptions,
      ...props,
      source: sourceValues
    };
    logger.debug("options =", options);

    const tagsInput = new BulmaTagsInput(tagsRef.current, options);

    tagsInput.on("after.add", (itemObj: { item: string; }) => {
      // added item 
      if (props.onChange) {
        updateSourceValues(itemObj.item);
        props.onChange((tagsInput.value as string).split(","));
      }
      setTagCount(prev => prev + 1);
    });
    tagsInput.on("after.remove", (item) => {
      // removed item 
      if (props.onChange) {
        props.onChange((tagsInput.value as string).split(","));
      }
      setTagCount(prev => prev - 1);
    });

    const updateSourceValues = (item: string) => {
      const sourceValueSet = new Set(props.sourceValues);
      props.defaultValue.forEach(value => sourceValueSet.add(value));
      if (item) sourceValueSet.add(item);

      sourceValues.length = 0;
      sourceValueSet.forEach(value => sourceValues.push(value));
    };

    updateSourceValues("");
    setTagCount(props.defaultValue.length);

    return () => {
      logger.debug("tagsRef.current =", tagsRef.current, ", tagsInput =", tagsInput, ", tagsInput.container =", tagsInput.container, ", html =", tagsInput.container.parentElement?.outerHTML);
      tagsInput.flush();
      tagsInput.destroy();

      // tagsInput.container.remove();
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
          defaultValue={ props.defaultValue.join(",") }
        />
      </div>
      <p className="help is-info has-text-right">
        { "counter: " + tagCount + (props.maxTags ? "/" + props.maxTags : "") }
      </p>
    </div>
  );
};

export default TagsInput;
