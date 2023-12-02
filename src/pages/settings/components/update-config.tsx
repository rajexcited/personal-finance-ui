import { FunctionComponent, useState } from "react";
import { ConfigType, ConfigTypeStatus } from "../../../services";
import { Input, InputValidators, Switch, TextArea } from "../../../components";

export type ConfigInputProps = {
    [key in keyof ConfigType]?: { placeholder?: string; tooltip?: string; idPrefix: string; };
};

interface UpdateConfigProps {
    details: ConfigType;
    inputProps: ConfigInputProps;
    onUpdate (details: ConfigType): void;
    onCancel (): void;
}

const UpdateConfig: FunctionComponent<UpdateConfigProps> = (props) => {
    const [name, setName] = useState(props.details.name);
    const [color, setColor] = useState(props.details.color || "");
    const [description, setDescription] = useState(props.details.description);
    const [status, setStatus] = useState(props.details.status === ConfigTypeStatus.enable);

    const validateName = InputValidators.nameValidator();

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const configData: ConfigType = {
            ...props.details,
            name,
            value: name,
            color,
            description,
            status: status ? ConfigTypeStatus.enable : ConfigTypeStatus.disable
        };
        props.onUpdate(configData);
    };

    const onCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        props.onCancel();
    };

    return (
        <section>
            <form onSubmit={ onSubmitHandler } >
                <div className="columns">
                    <div className="column">
                        <Input
                            id={ props.inputProps.name?.idPrefix + "-ctgry-name" }
                            initialValue={ name }
                            type="text"
                            label="Name: "
                            minlength={ 3 }
                            maxlength={ 15 }
                            required={ true }
                            placeholder={ props.inputProps.name?.placeholder }
                            tooltip={ props.inputProps.name?.tooltip }
                            validate={ validateName }
                            onChange={ setName }
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <Switch
                            id={ props.inputProps.status?.idPrefix + "-ctgry-status" }
                            initialStatus={ status }
                            labelWhenOn="Status is Enable"
                            labelWhenOff="Status is Disable"
                            onChange={ setStatus }
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column is-2">
                        <Input
                            id={ props.inputProps.name?.idPrefix + "-ctrgy-color" }
                            initialValue={ color }
                            type="color"
                            label="Color:"
                            onChange={ setColor }
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <TextArea
                            id={ props.inputProps.name?.idPrefix + "-ctrgy-description" }
                            label="Description"
                            value={ description }
                            placeholder={ props.inputProps.description?.placeholder }
                            maxlength={ 100 }
                            rows={ 2 }
                            cols={ 30 }
                            onChange={ setDescription }
                        />
                    </div>
                </div>
                <footer>
                    <div className="columns">
                        <div className="column">
                            <div className="buttons">
                                <button className="button" type="button" onClick={ onCancelHandler }> Cancel </button>
                            </div>
                        </div>
                        <div className="column">
                            <div className="buttons has-addons is-centered">
                                <button className="button is-dark" type="submit"> Save </button>
                            </div>
                        </div>
                    </div>
                </footer>
            </form>
        </section>
    );
};

export default UpdateConfig;
