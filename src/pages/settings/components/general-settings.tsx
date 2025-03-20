import { FunctionComponent, useState } from "react";
import { Radio } from "../../../components";

const THEME_ITEMS = ["System Default", "Dark", "Light"];

export const GeneralSettings: FunctionComponent = () => {

    const [selectedThemeItem, setSelectedThemeItem] = useState(THEME_ITEMS[2]);

    const onThemeChangeHandler = (newTheme: string) => {
        setSelectedThemeItem(newTheme);
    };

    return (
        <section className="general-settings">
            <div className="columns">
                <div className="column has-text-centered">
                    <span className="title">
                        General Settings
                    </span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <Radio
                        items={ THEME_ITEMS }
                        selectedItem={ selectedThemeItem }
                        label="Theme"
                        name="theme"
                        onChange={ onThemeChangeHandler }
                        disable={ true }
                    />

                </div>
            </div>
            <div>
            </div>
        </section>
    );
};

