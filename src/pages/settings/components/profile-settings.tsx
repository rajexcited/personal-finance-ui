import { FormEventHandler, FunctionComponent, MouseEventHandler, useEffect, useState } from "react";
import { Animated, Input } from "../../../components";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import { getFullPath } from "../../root";
import { RouteHandlerResponse, getLogger } from "../services";
import { ProfileDetailsLoaderResource } from "../route-handlers/profile-loader-action";
import ReactMarkdown from "react-markdown";
import { UpdateUserDetailsResource, useAuth } from "../../auth";

const fcLogger = getLogger("FC.settings.ProfileSettings", null, null, "DISABLED");

export const ProfileSettingsPage: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<ProfileDetailsLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const [updateNameRequest, setUpdateNameRequest] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const submit = useSubmit();
    const auth = useAuth();

    useEffect(() => {
        if (loaderData.type === "success") {
            setFirstName(loaderData.data.nameDetails.firstName);
            setLastName(loaderData.data.nameDetails.lastName);
        }
    }, [loaderData]);

    const onClickChangeNameHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        if (!auth.readOnly) {
            setUpdateNameRequest(true);
        }
    };

    const onClickChangeNameCancelHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        if (loaderData.type === "success") {
            setUpdateNameRequest(false);

            setFirstName(loaderData.data.nameDetails.firstName);
            setLastName(loaderData.data.nameDetails.lastName);
        }
    };

    const onSubmitNameChangeHandler: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        if (!auth.readOnly && loaderData.type === "success") {
            if (firstName !== loaderData.data.nameDetails.firstName || lastName !== loaderData.data.nameDetails.lastName) {
                const nameDetails: UpdateUserDetailsResource = {
                    firstName: firstName,
                    lastName: lastName
                };
                submit(nameDetails as any, { method: "post", action: getFullPath("profileSettings"), encType: "application/json" });
            }
            setUpdateNameRequest(false);
        }
    };

    fcLogger.debug("loaderData =", loaderData, ", actionData =", actionData);
    const errorMessage = loaderData.type === "error" ? loaderData.errorMessage : actionData?.type === "error" ? actionData.errorMessage : null;

    return (
        <section className="profile-settings">
            {
                errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp" scrollBeforePlayIn={ true }>
                    <article className="message is-danger">
                        <div className="message-body">
                            <ReactMarkdown children={ errorMessage } />
                        </div>
                    </article>
                </Animated>
            }
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
                                        !auth.readOnly && !updateNameRequest &&
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
                    <h2 className="title">Currency Profiles</h2>
                </div>
            </div>
            {
                loaderData.type === "success" && loaderData.data.currencyProfiles.map(currencyProfile =>
                    <div className="columns" key={ currencyProfile.id }>
                        <div className="column is-narrow">
                            <label className="label">Country: </label>
                            <span> { currencyProfile.country.name } </span>
                        </div>
                        <div className="column">
                            <label className="label">Currency: </label>
                            <span> { currencyProfile.currency.name + " ( " + currencyProfile.currency.symbol + " )" } </span>
                        </div>
                    </div>
                )
            }
        </section>
    );
};

