import "./tags-input.css";
import { FunctionComponent, useRef, useEffect, useState, useMemo, useCallback } from "react";
import BulmaTagsInput, { BulmaTagsInputOptions } from '@creativebulma/bulma-tagsinput';
import "@creativebulma/bulma-tagsinput/dist/css/bulma-tagsinput.min.css";
import { getLogger, sleep } from "../../shared";
import { DeviceMode, useOrientation } from "../../hooks";
import { buildDropdown, initializeEventHandler, TagObject } from "./events";

interface TagsInputSharePersonProps {
  id: string;
  label: string;
  defaultValue: TagObject[];
  sourceValues: TagObject[];
  placeholder: string;
  maxTags?: number;
  onChange?(selectedValues: TagObject[]): void;
}

const defaultOptions: BulmaTagsInputOptions = {
  allowDuplicates: false,
  caseSensitive: false,
  clearSelectionOnTyping: false,
  closeDropdownOnItemSelect: true,
  delimiter: ',',
  freeInput: false,
  highlightDuplicate: true,
  highlightMatchesString: true,
  maxChars: 100,
  minChars: 2,
  noResultsLabel: 'No results found',
  removable: true,
  searchMinChars: 1,
  searchOn: 'text',
  selectable: true,
  tagClass: 'is-rounded is-link',
  trim: true,
  itemText: "displayText",
  itemValue: "searchText",
  maxTags: 5,
};

/**
 * doc link - https://bulma-tagsinput.netlify.app/get-started/usage/
 * https://wikiki.github.io/
 * 
 **/
const fcLogger = getLogger("FC.TagsInputSharePerson", null, null, "DISABLED");

const updateSourceValues = (sourceValues: TagObject[], defaultValueMap: Record<string, TagObject>, sourceValueMap: Record<string, TagObject>, item?: TagObject) => {
  const map = { ...defaultValueMap, ...sourceValueMap };
  if (item) {
    map[item.id] = item;
  }
  sourceValues.length = 0;
  sourceValues.push(...Object.values(map));
};

export const TagsInputSharePerson: FunctionComponent<TagsInputSharePersonProps> = (props) => {
  const tagsRef = useRef<HTMLInputElement>(null);
  const [tagCount, setTagCount] = useState(0);
  const [bulmaTagsInput, setBulmaTagsInput] = useState<BulmaTagsInput>();
  const { resultedDevice: deviceMode } = useOrientation(DeviceMode.Mobile);

  const defaultValueMap: Record<string, TagObject> = useMemo(() => ({}), []);
  const sourceValueMap: Record<string, TagObject> = useMemo(() => ({}), []);
  const sourceValues: TagObject[] = useMemo(() => ([]), []);

  const updateSourceValueWrapper = useCallback(updateSourceValues.bind(null, sourceValues, defaultValueMap, sourceValueMap), [sourceValues, defaultValueMap, sourceValueMap]);

  useEffect(() => {
    // allow only first time update, rest will be ignore
    const kk = Object.keys(defaultValueMap);
    if (kk.length === 0) {
      props.defaultValue.forEach(dv => {
        defaultValueMap[dv.displayText] = dv;
      });
      updateSourceValueWrapper(undefined);
      if (bulmaTagsInput && props.defaultValue.length > 0) {
        bulmaTagsInput.add(props.defaultValue);
      }
    }
  }, [props.defaultValue, defaultValueMap]);

  useEffect(() => {
    const logger = getLogger("useEffect.dep[props.sourceValues, sourceValueMap, bulmaTagsInput]", fcLogger);
    // reset sources if any update received
    const kk = Object.keys(sourceValueMap);
    kk.forEach(k => delete sourceValueMap[k]);

    props.sourceValues.forEach(sv => {
      sourceValueMap[sv.displayText] = sv;
    });

    updateSourceValueWrapper(undefined);
    if (bulmaTagsInput) {
      buildDropdown(bulmaTagsInput, props.sourceValues, logger);
    }
  }, [props.sourceValues, sourceValueMap, bulmaTagsInput]);

  useEffect(() => {
    const logger = getLogger("useEffect.dep[tagsRef.current]", fcLogger);
    logger.debug("tagsRef.current =", tagsRef.current);
    // this will never happen in useEffect
    if (!tagsRef.current) {
      return;
    }

    const options = {
      ...defaultOptions,
      searchMinChars: deviceMode === DeviceMode.Mobile ? 0 : defaultOptions.searchMinChars,
      source: sourceValues as any[]
    };

    if (props.placeholder) {
      options.placeholder = props.placeholder;
    }
    if (props.maxTags) {
      options.maxTags = props.maxTags;
    }

    logger.debug("options =", options);

    const tagsInput = new BulmaTagsInput(tagsRef.current, options);
    setBulmaTagsInput(tagsInput);
    const unbindEvents = initializeEventHandler(tagsInput);

    tagsInput.on("after.add", (itemObj: { item: TagObject; }) => {
      // added item 
      logger.debug("after.add, itemObj =", itemObj, " tagsInput =", tagsInput, "items =", tagsInput.items);
      if (props.onChange) {
        const tagItems = tagsInput.items as TagObject[];
        const valueMap = { ...defaultValueMap, ...sourceValueMap };
        const selectedTagItems = tagItems.map(ti => valueMap[ti.displayText]);
        props.onChange(selectedTagItems);
      }
      setTagCount(prev => prev + 1);
    });

    tagsInput.on("after.remove", (item) => {
      // removed item 
      logger.debug("after.remove, itemObj =", item, " tagsInput =", tagsInput, "items =", tagsInput.items);
      if (props.onChange) {
        const tagItems = tagsInput.items as TagObject[];
        const valueMap = { ...defaultValueMap, ...sourceValueMap };
        const selectedTagItems = tagItems.map(ti => valueMap[ti.displayText]);
        props.onChange(selectedTagItems);
      }
      setTagCount(prev => prev - 1);
      buildDropdown(tagsInput, props.sourceValues, logger);
    });
    tagsInput.on("after.select", (itemObj) => {
      // when selected in mobile device, trigger remove
      if (deviceMode === DeviceMode.Mobile) {
        const tagElement = itemObj.tag as HTMLSpanElement;
        const deleteButton = tagElement.querySelector(".delete") as HTMLButtonElement | null;
        sleep("300ms").then(() => deleteButton?.click());
      }
    });
    updateSourceValueWrapper(undefined);
    setTagCount(props.defaultValue.length);
    const selected = Object.values(defaultValueMap);
    if (selected.length > 0) {
      tagsInput.add(selected);
    }


    return () => {
      logger.debug("tagsRef.current =", tagsRef.current, ", tagsInput =", tagsInput, ", tagsInput.container =", tagsInput.container, ", html =", tagsInput.container.parentElement?.outerHTML);
      unbindEvents();
      tagsInput.flush();
      tagsInput.destroy();

      document.removeEventListener("click", tagsInput._onDocumentClick);
    };

  }, []);



  return (
    <div className="field">
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
          autoCapitalize="off"
        />
      </div>
      <p className="help is-info has-text-right">
        { "counter: " + tagCount + (props.maxTags ? "/" + props.maxTags : "") }
      </p>
    </div>
  );
};

