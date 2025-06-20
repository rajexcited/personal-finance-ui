import "./tags-input.css";
import { FunctionComponent, useRef, useEffect, useState } from "react";
import BulmaTagsInput, { BulmaTagsInputOptions } from '@creativebulma/bulma-tagsinput';
import "@creativebulma/bulma-tagsinput/dist/css/bulma-tagsinput.min.css";
import { getLogger, sleep, testAttributes } from "../../shared";
import { DeviceMode, useOrientation } from "../../hooks";
import { buildDropdown, initializeEventHandler } from "./events";


interface TagsInputProps {
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
  delimiter: ",",
  freeInput: true,
  highlightDuplicate: true,
  highlightMatchesString: true,
  maxChars: 15,
  minChars: 2,
  noResultsLabel: "No results found",
  removable: true,
  searchMinChars: 1,
  searchOn: "text",
  selectable: true,
  tagClass: "is-rounded is-link",
  trim: true,
  itemText: "val",
  maxTags: 10
};


const fcLogger = getLogger("FC.TagsInput", null, null, "DISABLED");

/**
 * doc link - https://bulma-tagsinput.netlify.app/get-started/usage/
 * https://wikiki.github.io/
 **/
export const TagsInput: FunctionComponent<TagsInputProps> = (props) => {
  const tagsRef = useRef<HTMLInputElement>(null);
  const [tagCount, setTagCount] = useState(0);
  const { resultedDevice: deviceMode } = useOrientation(DeviceMode.Mobile);

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
      searchMinChars: deviceMode === DeviceMode.Mobile ? 0 : defaultOptions.searchMinChars,
      source: sourceValues
    };
    logger.debug("options =", options);

    const tagsInput = new BulmaTagsInput(tagsRef.current, options);
    const unbindEvents = initializeEventHandler(tagsInput);
    buildDropdown(tagsInput, props.sourceValues, logger);

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
        const tval = tagsInput.value as string;
        const updatedTags = [];
        if (tval) {
          updatedTags.push(...tval.split(","));
        }
        props.onChange(updatedTags);
      }
      buildDropdown(tagsInput, sourceValues, logger);
      setTagCount(prev => prev - 1);
    });
    tagsInput.on("after.select", (itemObj) => {
      // when selected in mobile device, trigger remove
      if (deviceMode === DeviceMode.Mobile) {
        const tagElement = itemObj.tag as HTMLSpanElement;
        const deleteButton = tagElement.querySelector(".delete") as HTMLButtonElement | null;
        sleep("300ms").then(() => deleteButton?.click());
      }
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
      unbindEvents();
      tagsInput.flush();
      tagsInput.destroy();

      document.removeEventListener("click", tagsInput._onDocumentClick);
    };

  }, []);



  return (
    <div className="field" { ...testAttributes("tags-field", "id", props.id) }>
      <label className="label">{ props.label }</label>
      {
        deviceMode === DeviceMode.Mobile &&
        <p className="help is-info">
          tap on item to select tag from list or type comma to add written new tag
        </p>
      }
      <div className="control">
        <input ref={ tagsRef }
          type="text"
          placeholder={ props.placeholder }
          className="input is-large"
          data-type="tags"
          defaultValue={ props.defaultValue.join(",") }
          autoCapitalize="off"
        />
      </div>
      <p className="help is-info has-text-right" { ...testAttributes(props.id + "-tags-counter") }>
        { "counter: " + tagCount + (props.maxTags ? "/" + props.maxTags : "") }
      </p>
    </div>
  );
};
