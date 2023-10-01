import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useState } from "react";
import { PymtAccountFields } from "../../store";

export interface AccountItemProps {
    id: string;
    details: PymtAccountFields;
}

const AccountItemCard: FunctionComponent<AccountItemProps> = (props) => {

    const [isBodyOpen, setBodyOpen] = useState(false);
    const onClickBodyToggleHandler: React.MouseEventHandler<HTMLButtonElement | HTMLParagraphElement> = event => {
        event.preventDefault();
        setBodyOpen((oldstate) => !oldstate);
    };

    const onClickUpdateHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
    };

    const onClickDeleteHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
    };

    return (
        <section className="container mb-2 p-2">
            <div className="card">
                <header className="card-header">
                    <p className="card-header-title" onClick={ onClickBodyToggleHandler }>
                        <span className="card-header-icon">
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
                <div className={ `card-content ${isBodyOpen ? "is-active" : "is-hidden"}` }>
                    <div className="content">
                        <div className="columns is-variable">
                            <div className="column">
                                <label className="label">Account Name: </label>
                                <span>{ props.details.accountName }</span>
                            </div>
                            <div className="column">
                                <label className="label">Institution Name: </label>
                                <span>{ props.details.institutionName }</span>
                            </div>
                            <div className="column">
                                <label className="label">Account Number: </label>
                                <span>{ props.details.accountNumber }</span>
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
                                        props.details.tags && props.details.tags.split(",").map(
                                            tag => <span className="tag is-link">{ tag }</span>
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
                <footer className={ `card-footer ${isBodyOpen ? "is-active" : "is-hidden"}` }>
                    <div className="container my-1 p-1 mr-3 pr-3">
                        <div className="columns ">
                            <div className="column is-offset-8 has-text-right">
                                audit details
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

        </section>
    );
};

export default AccountItemCard;