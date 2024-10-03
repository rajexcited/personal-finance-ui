import { FunctionComponent } from "react";
import dateutil from "date-and-time";
import { SharePersonResource } from "../../services";


interface ViewSharePersonProps {
    details: SharePersonResource;
}

export const ViewSharePerson: FunctionComponent<ViewSharePersonProps> = (props) => {

    return (
        <section className="view-share-person-settings">
            <div className="columns">
                <div className="column">
                    <label className="label">Email Id: </label>
                    <span>{ props.details.emailId }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">Status: </label>
                    <span>{ props.details.status }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">First Name: </label>
                    <span>{ props.details.firstName }</span>
                </div>
                <div className="column">
                    <label className="label">Last Name: </label>
                    <span>{ props.details.lastName }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">Nick name: </label>
                    <span>{ props.details.nickName || "-" }</span>
                </div>
                <div className="column">
                    <label className="label">Phone no: </label>
                    <span>{ props.details.phone || "-" }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">Description: </label>
                    <span>{ props.details.description || "-" }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">Created Date: </label>
                    <span>{ props.details.auditDetails.createdOn instanceof Date ? dateutil.format(props.details.auditDetails.createdOn, "MM-DD-YYYY hh:mm:ss A") : "-" }</span>
                </div>
                <div className="column">
                    <label className="label">Last Updated Date: </label>
                    <span>{ props.details.auditDetails.updatedOn instanceof Date ? dateutil.format(props.details.auditDetails.updatedOn, "MM-DD-YYYY hh:mm:ss A") : "-" }</span>
                </div>
            </div>
        </section>
    );
};

