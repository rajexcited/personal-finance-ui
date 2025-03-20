import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FunctionComponent, useState } from "react";
import { Input, InputValidators, Switch, TagsInput, TextArea } from "../../../../components";
import { ConfigTypeStatus, SharePersonResource, UpdateSharePersonResource } from "../../services";
import { ConfigAction } from "../../../../shared";

interface UpdateSharePersonProps {
    details: SharePersonResource;
    sourceTags: string[];
    onUpdate (details: UpdateSharePersonResource): void;
    onCancel (): void;
}

export const UpdateSharePerson: FunctionComponent<UpdateSharePersonProps> = (props) => {
    const [emailId, setEmailId] = useState(props.details.emailId);
    const [firstName, setFirstName] = useState(props.details.firstName);
    const [lastName, setLastName] = useState(props.details.lastName);
    const [nickName, setNickName] = useState(props.details.nickName || "");
    const [phone, setPhone] = useState(props.details.phone || "");
    const [description, setDescription] = useState(props.details.description);
    const [status, setStatus] = useState(props.details.status === ConfigTypeStatus.Enable);
    const [tags, setTags] = useState(props.details.tags);

    const validateName = InputValidators.nameValidator();
    const validatePhoneNo = InputValidators.phoneNoValidator();

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const configData: UpdateSharePersonResource = {
            ...props.details,
            description,
            status: status ? ConfigTypeStatus.Enable : ConfigTypeStatus.Disable,
            emailId: emailId,
            firstName: firstName,
            lastName: lastName,
            nickName: nickName,
            phone: phone,
            action: ConfigAction.AddUpdateDetails,
            tags: tags
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
                            id="sp-email"
                            initialValue={ emailId }
                            type="email"
                            label="Email Id: "
                            maxlength={ 50 }
                            required={ true }
                            placeholder="Enter Email id"
                            onChange={ setEmailId }
                            leftIcon={ faEnvelope }
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <Switch
                            id="sp-status"
                            initialStatus={ status }
                            labelWhenOn="Status is Enable"
                            labelWhenOff="Status is Disable"
                            onChange={ setStatus }
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <Input
                            id="sp-fn"
                            initialValue={ firstName }
                            type="text"
                            label="First Name: "
                            minlength={ 2 }
                            maxlength={ 25 }
                            required={ true }
                            placeholder="Enter First name"
                            onChange={ setFirstName }
                            validate={ validateName }
                        />
                    </div>
                    <div className="column">
                        <Input
                            id="sp-ln"
                            initialValue={ lastName }
                            type="text"
                            label="Last Name: "
                            minlength={ 2 }
                            maxlength={ 25 }
                            required={ true }
                            placeholder="Enter Last name"
                            onChange={ setLastName }
                            validate={ validateName }
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <Input
                            id="sp-nickname"
                            initialValue={ nickName }
                            type="text"
                            label="Nick Name: "
                            minlength={ 2 }
                            maxlength={ 25 }
                            placeholder="Enter Nick name"
                            onChange={ setNickName }
                            validate={ validateName }
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <Input
                            id="sp-phone"
                            initialValue={ phone }
                            type="tel"
                            label="Phone Number: "
                            minlength={ 10 }
                            maxlength={ 15 }
                            placeholder="Enter Phone number"
                            onChange={ setPhone }
                            validate={ validatePhoneNo }
                        />
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <TextArea
                            id="sp-description"
                            label="Description: "
                            value={ description }
                            placeholder="Enter Description"
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

