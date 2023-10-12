// doc link - https://bulma-tagsinput.netlify.app/get-started/usage/
declare module "@creativebulma/bulma-tagsinput" {
  export interface BulmaTagsInputOptions {
    allowDuplicates?: boolean; // Are duplicate tags allowed ?
    caseSensitive?: boolean; // Is duplicate tags identification case sensitive ?
    clearSelectionOnTyping?: boolean; // Should selected tag be cleared when typing a new input ?
    closeDropdownOnItemSelect?: boolean; // Should dropdown be closed once an item has been clicked ?
    delimiter?: string; // Multiple tags delimiter
    freeInput?: boolean; // Should user be able to input new tag manually ?
    highlightDuplicate?: boolean; // Should we temporarly highlight identified duplicate tags ?
    highlightMatchesString?: boolean; // Should we highlight identified matches strings when searching ?
    itemValue?: string; // What is the object property to use as value when we work with Object tags ?
    itemText?: string; // What is the object property to use as text when we work with Object tags ?
    maxTags?: number; // Maximum number of tags allowed
    maxChars?: number; // Maximum of characters allowed for a single tag
    minChars?: number; // Minimum of characters before processing a new tag
    noResultsLabel?: string; // Customize the dropdown placecholer when no results found
    placeholder?: string; // Customize the input placholder
    removable?: boolean; // Are tags removable ?
    searchMinChars?: number; // How many characters should we enter before starting dynamic search ?
    searchOn?: string; // On what dropdown item data do we search the entered value : 'value' or 'text' ?
    selectable?: boolean; // Are tags selectable ?
    source?: string | string[] | ((val: string) => string); // Array/Function/Promise to get external data
    tagClass?: string; // Customize tags style by passing classes - They will be added to the tag element
    trim?: boolean; // Should we trim value before processing them ?
  }

  export default class BulmaTagsInput {
    /**
     * Initiate all DOM element corresponding to selector
     * @method
     * @return {Array} Array of all Plugin instances
     */
    static attach(selector?: string, options?: BulmaTagsInputOptions, container?: any): any[];
    constructor(element: HTMLElement, options?: BulmaTagsInputOptions);

    /**
     * Observe DOM mutations to automatically initialize plugin on new elements when added to the DOM
     *
     * @param {string} selector
     * @param {Object} options
     */
    static observeDom(selector: string, options: BulmaTagsInputOptions): void;

    /**
     * Get items
     */
    items(): () => any;
    source: any;
    container: Element;
    /**
     * Returns the internal input element
     */
    input(): () => any;
    dropdown: Element;
    dropdownEmptyOption: Element;
    /**
     * Add given item
     * item = 'john'
     * item = 'john,jane'
     * item = ['john', 'jane']
     * item = [{
     *  "value": "1",
     *  "text": "John"
     * }, {
     *  "value": "2",
     *  "text": "Jane"
     * }]
     * @param {String|Object} item
     * @param {Boolean} silently Should the change be propagated to the original element
     */
    add(items: any, silently?: boolean): this;
    /**
     * Unselect the selected item
     */
    clearSelection(): this;
    /**
     * Shortcut to removeAll method
     */
    flush(): this;
    /**
     * Sets focus on the input
     */
    focus(): this;
    /**
     * Check if given item is present
     * @param {String} item
     */
    has(item: string): any;
    /**
     * Check if given text is present
     * @param {String} value
     */
    hasText(value: string): any;
    /**
     * Check if given value is present
     * @param {String} value
     */
    hasValue(value: string): any;
    /**
     * Get index of given item
     * @param {string} item
     */
    indexOf(item: string): any;
    /**
     * Remove given item
     * item = 'john'
     * item = 'john,jane'
     * @param String item
     */
    remove(items: any): this;
    /**
     * Remove all tags at once
     */
    removeAll(): this;
    /**
     * Remove item at given index
     * @param Integer index
     */
    removeAtIndex(index: any, clearSelection?: boolean): this;
    /**
     * Select given item
     * @param {string} item
     */
    select(items: any): this;
    /**
     * Select tag at given index
     * @param Integer index
     */
    selectAtIndex(index: any): this;
    /**
     * Get selected item
     */
    get selected(): any;
    /**
     * Get selected item index
     */
    get selectedIndex(): number;
    /**
     * Set value
     */
    set value(arg: any);
    /**
     * Get value
     */
    get value(): any;
    /**
     * Count listeners registered for the provided eventName
     *
     * @param {string} eventName
     */
    listenerCount(eventName: EventType): any;
    /**
     * Subscribes on event eventName specified function
     *
     * @param {string} eventName
     * @param {function} listener
     */
    on(eventName: EventType, listener: (itemOrObj: any) => void): void;
    /**
     * Subscribes on event name specified function to fire only once
     *
     * @param {string} eventName
     * @param {function} listener
     */
    once(eventName: EventType, listener: (item: string) => void): void;
    /**
     * Removes event with specified eventName.
     *
     * @param {string} eventName
     */
    off(eventName: EventType): void;
    /**
     * Emits event with specified name and params.
     *
     * @param {string} eventName
     * @param eventArgs
     */
    emit(eventName: EventType, ...eventArgs: string[]): string;
    /**
     * Destroys EventEmitter
     */
    destroy(): void;
    /** remove event listener from document for this method to destroy the instance.
     * because of this method bound with document click event, memory and events are leaking.
     * dom are not getting cleanup.
     *
     */
    _onDocumentClick(): void;
  }

  export type EventType =
    | "before.dropdown.close"
    | "after.dropdown.close"
    | "before.dropdown.filter"
    | "after.dropdown.filter"
    | "before.add"
    | "after.add"
    | "item.duplicate"
    | "before.unselect"
    | "after.unselect"
    | "before.flush"
    | "after.flush"
    | "before.remove"
    | "after.remove"
    | "before.select"
    | "after.select"
    | "on.results.received";
}
