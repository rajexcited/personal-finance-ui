import { FormEventHandler, FunctionComponent, MouseEventHandler, useEffect, useState } from "react";
import { Input } from "../../../components";
import { useLoaderData, useSubmit } from "react-router-dom";
import { SecurityDetailType } from "../../auth/services/field-types";
import { PAGE_URL } from "../../root";


const ProfileSettings: FunctionComponent = () => {
    const loaderData = useLoaderData() as SecurityDetailType;
    const [updateNameRequest, setUpdateNameRequest] = useState(false);
    const [firstName, setFirstName] = useState(loaderData.firstName || "");
    const [lastName, setLastName] = useState(loaderData.lastName || "");
    const submit = useSubmit();

    useEffect(() => {
        if (loaderData.firstName && loaderData.firstName !== firstName) setFirstName(loaderData.firstName);
        if (loaderData.lastName && loaderData.lastName !== lastName) setLastName(loaderData.lastName);
    }, [loaderData]);

    const onClickChangeNameHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setUpdateNameRequest(true);
    };

    const onClickChangeNameCancelHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setUpdateNameRequest(false);
        setFirstName(loaderData.firstName || "");
        setLastName(loaderData.lastName || "");
    };

    const onSubmitNameChangeHandler: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        submit({ firstName, lastName }, { action: PAGE_URL.profileSettings.fullUrl, method: "post" });
        setUpdateNameRequest(false);
    };


    return (
        <section className="profile-settings">
            <div className="columns">
                <div className="column is-offset-1">
                    <h2 className="title">Personal Details</h2>
                </div>
            </div>
            <div className="columns">
                <div className="column">

                    <form onSubmit={ onSubmitNameChangeHandler }>
                        <div className="columns">
                            <div className="column">
                                <Input
                                    id="firstname"
                                    initialValue={ firstName }
                                    type="text"
                                    disabled={ !updateNameRequest }
                                    label="First Name: "
                                    labelInline={ true }
                                    maxlength={ 25 }
                                    required={ true }
                                    pattern="[\w\s]+"
                                    onChange={ setFirstName }
                                />
                            </div>
                            <div className="column">
                                <Input
                                    id="lastname"
                                    initialValue={ lastName }
                                    type="text"
                                    disabled={ !updateNameRequest }
                                    label="Last Name: "
                                    labelInline={ true }
                                    maxlength={ 25 }
                                    required={ true }
                                    pattern="[\w\s]+"
                                    onChange={ setLastName }
                                />
                            </div>
                            <div className="column">
                                <div className="buttons">
                                    {
                                        updateNameRequest &&
                                        <>
                                            <button className="button is-dark" type="submit">Update</button>
                                            <button className="button" type="button" onClick={ onClickChangeNameCancelHandler }>Cancel</button>
                                        </>
                                    }
                                    {
                                        !updateNameRequest &&
                                        <button className="button is-dark" type="button" onClick={ onClickChangeNameHandler }>Change Name</button>
                                    }
                                </div>
                            </div>
                            <div className="column"></div>
                        </div>
                    </form>
                </div>
            </div>
            <div className="columns">
                <div className="column is-offset-1">
                    <h2 className="title">Currency Profile</h2>
                </div>
            </div>
            <div className="columns">
                <div className="column is-narrow">
                    <label className="label">Country: </label>
                    <span> United States of America </span>
                </div>
                <div className="column">
                    <label className="label">Currency: </label>
                    <span> Dollar ( $ ) </span>
                </div>
            </div>
        </section>
    );
};

export default ProfileSettings;