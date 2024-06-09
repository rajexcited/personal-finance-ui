import { FunctionComponent, useEffect, useRef, useState } from 'react';
import 'bulma-calendar/dist/css/bulma-calendar.min.css';
import './calendar.css';
import bulmaCalendar from "bulma-calendar";
import dateutils from "date-and-time";
import { getLogger } from '../services';

export interface CalendarProps extends bulmaCalendar.Options {
    id: string;
    label: string;
    startDate?: Date;
    onSelect (value: { start?: Date, end?: Date; }): void;
}

const defaultOptions: bulmaCalendar.Options = {
    type: "date",
    color: "link",
    // startDate: undefined,
    // endDate: undefined,
    isRange: false,
    allowSameDayRange: false,
    showClearButton: false,
    // maxDate: undefined,
    // timeFormat: undefined,
    showButtons: false,
    // toggleOnInputClick: false,
    displayMode: "inline"
};

const Calendar: FunctionComponent<CalendarProps> = (props) => {
    const calendarRef = useRef<HTMLInputElement>(null);
    const [calendarInstance, setCalendarInstance] = useState<bulmaCalendar>();
    const [calState, setCalState] = useState('notready');

    useEffect(() => {
        const logger = getLogger("FC.calendar.useEffect.dep[calendarRef.current]");
        if (!calendarRef.current || calendarInstance)
            return;

        const options: bulmaCalendar.Options = {
            ...defaultOptions,
            ...props
        };
        if (options.startDate)
            options.maxDate = dateutils.addMonths(options.startDate, 1);

        options.onReady = () => {
            setCalState('ready');
        };

        logger.log(calendarRef.current, props);
        const calendar = bulmaCalendar.attach(`input[type="date"]#${props.id}`, options)[0];
        logger.log(calendar);
        setCalendarInstance(calendar);

        // todo destroy calendar instance. and remove document event listeners. can cause leaking issues.
    }, [calendarRef.current]);

    useEffect(() => {
        if (!calendarInstance) return;
        // bulmaCalendar instance is available as element.bulmaCalendar
        calendarInstance.on('select', (datepicker: bulmaCalendar.Event) => {
            props.onSelect(datepicker.data.date);
        });
    }, [calendarInstance]);

    if (calendarRef.current && calendarInstance && calState === "ready") {
        const todayFooterClassList = calendarRef.current.querySelector(".datetimepicker-footer-today.button")?.classList;
        todayFooterClassList?.remove("has-text-warning");
        todayFooterClassList?.add("is-ghost");
        // to set the today date as default selection
        if (props.startDate && calendarInstance) {
            calendarInstance.refresh();
        }
        setCalState("rendered");
    }

    return (
        <div className="field px-5 mx-2">
            <label htmlFor={ props.id } className="label">{ props.label }</label>
            <div className="control" ref={ calendarRef }>
                <input type="date" key={ `${props.id}-inputDate` } id={ props.id } />
            </div>
        </div>
    );

};

export default Calendar;
