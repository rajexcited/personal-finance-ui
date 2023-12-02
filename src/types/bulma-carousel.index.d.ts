declare module "bulma-carousel" {
  export interface BulmaCarouselOptions {
    // Initial item index
    initialSlide?: number;
    // Slide to scroll on each step
    slidesToScroll?: number;
    // Slides to show at a time
    slidesToShow?: number;
    // Display navigation buttons
    navigation?: boolean;
    // Enable navigation with arrow keys
    navigationKeys?: boolean;
    // Enable swipe navigation
    navigationSwipe?: boolean;
    // Display pagination bullets
    pagination?: boolean;
    // Activate loop display mode
    loop?: boolean;
    // Activate infinite display mode
    infinite?: boolean;
    // Animation effect for item transition (translate|fade)
    effect?: "translate" | "fade";
    // Transition animation duration (in ms)
    duration?: number;
    // Transiation animation type
    timing?: string;
    // Autoplay carousel
    autoplay?: boolean;
    // Time between each transition when autoplay is active (ms)
    autoplaySpeed?: number;
    // Stop autoplay when cursor hover carousel
    pauseOnHover?: boolean;
    // List all breakpoints for responsiveness
    breakpoints?: {
      changePoint: number;
      slidesToShow: number;
      slidesToScroll: number;
    }[];
    onReady?(carousel: bulmaCarousel): void;
    icons?: {
      previous: string;
      next: string;
    };
  }

  export default class bulmaCarousel {
    /**
     * Initiate all DOM element containing datePicker class
     * @method
     * @return {Array} Array of all datePicker instances
     */
    static attach(selector?: string, options?: BulmaCarouselOptions): any[];
    constructor(selector: HTMLElement, options?: BulmaCarouselOptions);
    /****************************************************
     *                                                  *
     * EVENTS FUNCTIONS                                 *
     *                                                  *
     ****************************************************/
    onShow(e: any): void;
    node: DocumentFragment;
    /****************************************************
     *                                                  *
     * GETTERS and SETTERS                              *
     *                                                  *
     ****************************************************/
    /**
     * Get id of current datePicker
     */
    get id(): string;
    set index(arg: any);
    get index(): any;
    set length(arg: any);
    get length(): any;
    set slides(arg: any);
    get slides(): any;
    get slidesToScroll(): any;
    get slidesToShow(): any;
    get direction(): "ltr" | "rtl";
    get wrapper(): ChildNode;
    get wrapperWidth(): any;
    get container(): Element;
    get containerWidth(): number;
    get slideWidth(): number;
    get transitioner(): Transitioner;
    /****************************************************
     *                                                  *
     * PUBLIC FUNCTIONS                                 *
     *                                                  *
     ****************************************************/
    next(): void;
    previous(): void;
    start(): void;
    pause(): void;
    stop(): void;
    show(index: any, force?: boolean): void;
    reset(): void;
    state: {
      length: number;
      index: number;
      next: number;
      prev: any;
    };
    /**
     * Destroy Slider
     * @method destroy
     */
    destroy(): void;
    /**
     * Subscribes on event eventName specified function
     *
     * @param {string} eventName
     * @param {function} listener
     */
    on(eventName: EventType, listener: (itemOrObj: any) => void): void;
    /**
     * Emits event with specified name and params.
     *
     * @param {string} eventName
     * @param eventArgs
     */
    emit(eventName: EventType, ...eventArgs: string[]): string;
  }

  export type EventType = "start" | "stop" | "before:show" | "after:show" | "show";
}
