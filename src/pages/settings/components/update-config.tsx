import { FunctionComponent, useState } from "react";
import { ConfigResource, ConfigTypeStatus, UpdateConfigDetailsResource } from "../services";
import { Input, InputValidators, Switch, TagsInput, TextArea } from "../../../components";

export type ConfigInputProps = {
    [key in keyof ConfigResource]?: { placeholder?: string; tooltip?: string; idPrefix: string; };
};

interface UpdateConfigProps {
    details: ConfigResource;
    inputProps: ConfigInputProps;
    sourceTags: string[];
    onUpdate (details: UpdateConfigDetailsResource): void;
    onCancel (): void;
}

const UpdateConfig: FunctionComponent<UpdateConfigProps> = (props) => {
    const [name, setName] = useState(props.details.name);
    const [color, setColor] = useState(props.details.color || "");
    const [description, setDescription] = useState(props.details.description);
    const [status, setStatus] = useState(props.details.status === ConfigTypeStatus.Enable);
    const [tags, setTags] = useState(props.details.tags);

    const validateName = InputValidators.nameValidator();

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const configData: UpdateConfigDetailsResource = {
            ...props.details,
            name,
            value: name,
            color,
            description,
            status: status ? ConfigTypeStatus.Enable : ConfigTypeStatus.Disable,
            tags,
            action: "addUpdateDetails"
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
                            id={ props.inputProps.name?.idPrefix + "-cfg-name" }
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
                            id={ props.inputProps.status?.idPrefix + "-cfg-status" }
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
                            id={ props.inputProps.name?.idPrefix + "-cfg-color" }
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
                            id={ props.inputProps.name?.idPrefix + "-cfg-description" }
                            label="Description"
                            value={ description }
                            placeholder={ props.inputProps.description?.placeholder }
                            maxlength={ 400 }
                            rows={ 2 }
                            cols={ 30 }
                            onChange={ setDescription }
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <TagsInput
                            id="cfg-tags"
                            label="Tags: "
                            defaultValue={ tags }
                            placeholder="Add Tags"
                            onChange={ setTags }
                            key={ "cfg-tags" }
                            sourceValues={ props.sourceTags }
                            maxTags={ 10 }
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
