import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useState } from "react";
import { PymtAccountFields, PymtAccStatus } from "../../services";
import { useNavigate } from "react-router";
import { getFullPath } from "../../../root";
import { Animated } from "../../../../components";
import { useAuth } from "../../../auth";
import { testAttributes } from "../../../../shared";

export interface AccountItemProps {
    id: string;
    details: PymtAccountFields;
    onDeleteRequest (pymtAccountId: string): void;
}

export const AccountItemCard: FunctionComponent<AccountItemProps> = (props) => {
    const [isBodyOpen, setBodyOpen] = useState(false);
    const navigate = useNavigate();
    const auth = useAuth();

    const onClickBodyToggleHandler: React.MouseEventHandler<HTMLButtonElement | HTMLSpanElement> = event => {
        event.preventDefault();
        setBodyOpen((oldstate) => !oldstate);
    };

    const onClickUpdateHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        navigate(getFullPath("updatePymAccount", props.details.id));
    };

    const onClickDeleteHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        props.onDeleteRequest(props.details.id);
    };

    return (
        <section className="container mb-3 px-2">
            <div className="card" { ...testAttributes("payment-account-card") }>
                <header className="card-header">
                    <p className="card-header-title">
                        <span className="card-header-icon" onClick={ onClickBodyToggleHandler }>
                            <span> { props.details.shortName } </span>
                        </span>
                    </p>
                    {
                        !auth.readOnly && [PymtAccStatus.Enable, PymtAccStatus.Immutable].includes(props.details.status) &&
                        <button className="card-header-icon" onClick={ onClickUpdateHandler } { ...testAttributes("card-header-action-update") }>Update</button>
                    }
                    {
                        !auth.readOnly && props.details.status === PymtAccStatus.Enable &&
                        <button className="card-header-icon" onClick={ onClickDeleteHandler } { ...testAttributes("card-header-action-delete") } >Delete</button>
                    }
                    <button className="card-header-icon" aria-label="expand breakdown" onClick={ onClickBodyToggleHandler } { ...testAttributes("card-header-action-expand-collapse") } >
                        <span className="icon">
                            <FontAwesomeIcon icon={ isBodyOpen ? faAngleUp : faAngleDown } />
                        </span>
                    </button>
                </header>
                <Animated animateOnMount={ false } isPlayIn={ isBodyOpen } animatedIn="fadeIn" animatedOut="fadeOut" isVisibleAfterAnimateOut={ false } >
                    <div className="card-content is-active">
                        <div className="content">
                            <div className="columns is-variable">
                                <div className="column">
                                    <label className="label">Account Name / Number: </label>
                                    <span { ...testAttributes("outvalue") } >{ props.details.accountIdNum }</span>
                                </div>
                                <div className="column">
                                    <label className="label">Institution Name: </label>
                                    <span { ...testAttributes("outvalue") }>{ props.details.institutionName }</span>
                                </div>
                            </div>
                            <div className="columns is-variable">
                                <div className="column">
                                    <label className="label">Account Type: </label>
                                    <span { ...testAttributes("outvalue") }>{ props.details.typeName }</span>
                                </div>
                                <div className="column">
                                    <label className="label">Tags: </label>
                                    <div className="tags" { ...testAttributes("outvalue") }>
                                        {
                                            props.details.tags &&
                                            props.details.tags.map(tag =>
                                                <span
                                                    className="tag is-link"
                                                    key={ tag + "-tag-key" }
                                                >
                                                    { tag }
                                                </span>
                                            )
                                        }
                                    </div>
                                </div>
                                <div className="column">&nbsp;</div>
                            </div>
                            <div className="columns is-variable">
                                <div className="column">
                                    <label className="label">Description: </label>
                                    <span { ...testAttributes("outvalue") }>{ props.details.description }</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <footer className="card-footer is-active"> </footer>
                </Animated>
            </div>
        </section>
    );
};

