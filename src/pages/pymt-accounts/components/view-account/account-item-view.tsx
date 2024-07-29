import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useState } from "react";
import { PymtAccountFields } from "../../services";
import { useNavigate } from "react-router-dom";
import { PAGE_URL } from "../../../root";
import { Animated } from "../../../../components";

export interface AccountItemProps {
    id: string;
    details: PymtAccountFields;
    onDeleteRequest (pymtAccountId: string): void;
}

const AccountItemCard: FunctionComponent<AccountItemProps> = (props) => {
    const [isBodyOpen, setBodyOpen] = useState(false);
    const navigate = useNavigate();

    const onClickBodyToggleHandler: React.MouseEventHandler<HTMLButtonElement | HTMLSpanElement> = event => {
        event.preventDefault();
        setBodyOpen((oldstate) => !oldstate);
    };

    const onClickUpdateHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        navigate(PAGE_URL.updatePymAccount.shortUrl.replace(":accountId", props.details.id));
    };

    const onClickDeleteHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        props.onDeleteRequest(props.details.id);
    };

    return (
        <section className="container mb-3 px-2">
            <div className="card">
                <header className="card-header">
                    <p className="card-header-title">
                        <span className="card-header-icon" onClick={ onClickBodyToggleHandler }>
                            <span>
                                { props.details.shortName }
                            </span>
                        </span>
                    </p>
                    <button className="card-header-icon" onClick={ onClickUpdateHandler }>Update</button>
                    <button className="card-header-icon" onClick={ onClickDeleteHandler }>Delete</button>
                    <button className="card-header-icon" aria-label="expand breakdown" onClick={ onClickBodyToggleHandler }>
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
                                    <span>{ props.details.accountIdNum }</span>
                                </div>
                                <div className="column">
                                    <label className="label">Institution Name: </label>
                                    <span>{ props.details.institutionName }</span>
                                </div>
                            </div>
                            <div className="columns is-variable">
                                <div className="column">
                                    <label className="label">Account Type: </label>
                                    <span>{ props.details.typeName }</span>
                                </div>
                                <div className="column">
                                    <label className="label">Tags: </label>
                                    <div className="tags">
                                        {
                                            props.details.tags &&
                                            props.details.tags.map(
                                                tag => <span
                                                    className="tag is-link"
                                                    key={ tag + "-tag-key" }
                                                >{ tag }</span>
                                            )
                                        }
                                    </div>

                                </div>
                                <div className="column">&nbsp;</div>
                            </div>
                            <div className="columns is-variable">
                                <div className="column">
                                    <label className="label">Description: </label>
                                    <span>{ props.details.description }</span>
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

export default AccountItemCard;