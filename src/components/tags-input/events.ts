import BulmaTagsInput from "@creativebulma/bulma-tagsinput";
import { getLogger, LoggerBase } from "../../shared";

export const initializeEventHandler = (tagsInput: BulmaTagsInput) => {
  /**
   * keypressed is deprecated and latest browser versions are not supporting.
   * use other supported key events.
   * references:
   *    https://developer.mozilla.org/en-US/docs/Web/API/Element/keypress_event
   *
   **/
  tagsInput.input.removeEventListener("keypress", tagsInput._onInputKeyPress);
  /** combining key event handlers */
  tagsInput.input.removeEventListener("keydown", tagsInput._onInputKeyDown);
  // keyup event works in both desktop and mobile. workaround to use existing old tagsinput component
  const onKeyupHandler = getKeyUpHandler(tagsInput);
  tagsInput.input.addEventListener("keyup", onKeyupHandler);
  return () => {
    tagsInput.input.removeEventListener("keyup", onKeyupHandler);
    tagsInput.input.removeEventListener("click", tagsInput._onInputClick);
    tagsInput.input.removeEventListener("input", tagsInput._onInputChange);
  };
};

const getKeyUpHandler = (tagsInput: BulmaTagsInput) => {
  function handler(this: BulmaTagsInput, event: KeyboardEvent) {
    const keyCode = event.code as KeyboardCode;
    let codenum;
    switch (keyCode) {
      case KeyboardCode.ArrowLeft:
        codenum = 37;
        break;
      case KeyboardCode.ArrowRight:
        codenum = 39;
        break;
      case KeyboardCode.Backspace:
        codenum = 8;
        break;
      case KeyboardCode.Delete:
        codenum = 46;
        break;
      case KeyboardCode.Enter:
        codenum = 13;
        break;
      case KeyboardCode.Escape:
        codenum = 27;
        break;
      default:
        codenum = 32;
    }
    const ev = new KeyboardEvent("keydown", {
      charCode: codenum
    });
    ev.preventDefault = () => {
      event.preventDefault();
    };
    if ([KeyboardCode.ArrowLeft, KeyboardCode.ArrowRight, KeyboardCode.Backspace, KeyboardCode.Delete, KeyboardCode.Escape].includes(keyCode)) {
      tagsInput._onInputKeyDown(ev);
    } else {
      const e = { charCode: codenum, preventDefault: () => event.preventDefault() };
      const returnValue = updateFilterDropdown.bind(tagsInput)(event);
      tagsInput._onInputKeyDown(ev);
      return returnValue;
    }
  }
  return handler.bind(tagsInput);
};

const isObject = (unknown: any) => (typeof unknown === "function" || (typeof unknown === "object" && !!unknown)) && !Array.isArray(unknown);

type TagItemResultType = string | Record<"value" | "text", string>;

function updateFilterDropdown(this: any, e: KeyboardEvent) {
  let value: string = this._trim(this.input.value);

  if (!this._manualInputAllowed && !this._filterInputAllowed) {
    e.preventDefault();

    return false;
  }

  // ENTER
  if (!value.length && e.code !== KeyboardCode.Enter) {
    return false;
  }

  if (this._filterInputAllowed) {
    this._filterDropdownItems(value);
  }

  if (this._filterInputAllowed && this.source && value.length >= this.options.searchMinChars && e.code !== KeyboardCode.Enter) {
    this._openDropdown();
    this.dropdown.classList.add("is-loading");
    this._emptyDropdown();

    let resultPromise;
    if (!value) {
      resultPromise = Promise.resolve(this.options.source);
    } else {
      resultPromise = this.source(value);
    }
    resultPromise
      .then((results: string[]) => {
        results = this.emit("on.results.received", results);

        if (results.length) {
          results.forEach((result) => {
            let item: TagItemResultType = {
              value: "null",
              text: "null"
            };

            if (!isObject(result)) {
              item.value = result;
              item.text = result;
            } else {
              item.value = result[this.options.itemValue];
              item.text = result[this.options.itemText];
            }

            this._createDropdownItem(item);
          });
        }

        this._filterDropdownItems(value);

        this.dropdown.classList.remove("is-loading");
      })
      .catch((error: Error) => {
        console.log(error);
      });
  }

  if (this._manualInputAllowed && (value.includes(this.options.delimiter) || e.code == KeyboardCode.Enter)) {
    // Prevent default behavior (ie: add char into input value)
    e.preventDefault();

    // Split value by delimiter in case we copy/paste multiple values
    const values = value.split(this.options.delimiter);
    values.forEach((value) => {
      // check if empty text when delimiter is removed
      if ((value = value.replace(this.options.delimiter, "")) != "") {
        // push to array and remove delimiter
        this.add(value);
      }
    });

    value = "";
    // clear input
    this.input.value = "";

    this._closeDropdown();
    buildDropdown(this, this.options.source);

    return false;
  }
}

export enum KeyboardCode {
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
  Enter = "Enter",
  Backspace = "Backspace",
  Delete = "Delete",
  Escape = "Escape"
}

export interface TagObject {
  searchText: string;
  displayText: string;
  id: string;
}

export const buildDropdown = (tagsInput: BulmaTagsInput, sourceValues: string[] | TagObject[], _logger?: LoggerBase) => {
  const logger = getLogger("buildDropdown", _logger);

  const dropdownItemCount = Array.from(tagsInput.dropdown.children).filter((child) => !child.classList.contains("empty-title")).length;
  if (dropdownItemCount === sourceValues.length) {
    return;
  }

  tagsInput.dropdown.classList.add("is-loading");
  logger.debug("to rebuild dropdown, emptying the existing");
  tagsInput._emptyDropdown();

  logger.debug("starting to build dropdown", sourceValues.length, "items with source=", sourceValues);
  const results = [...sourceValues];
  results.forEach((result) => {
    let item: TagItemResultType = {
      value: "null",
      text: "null"
    };

    if (!isObject(result)) {
      const res = result as string;
      item.value = res;
      item.text = res;
    } else {
      const res = result as TagObject;
      item.value = res.searchText;
      item.text = res.displayText;
    }

    logger.debug("before creating dropdown item call. item=", item, "method definition=", tagsInput._createDropdownItem);
    tagsInput._createDropdownItem(item);
  });

  logger.debug("trigger dropdown filter method to initialize state");
  tagsInput._filterDropdownItems(null);

  tagsInput.dropdown.classList.remove("is-loading");
};
