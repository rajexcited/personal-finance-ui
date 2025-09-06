import { FunctionComponent } from "react";
import * as datetime from "date-and-time";
import { SharePersonResource } from "../../services";
import { testAttributes } from "../../../../shared";


interface ViewSharePersonProps {
    details: SharePersonResource;
}

export const ViewSharePerson: FunctionComponent<ViewSharePersonProps> = (props) => {

    return (
        <section className="view-share-person-settings">
            <div className="columns">
                <div className="column">
                    <label className="label">Email Id: </label>
                    <span { ...testAttributes("outvalue") }>{ props.details.emailId }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">Status: </label>
                    <span { ...testAttributes("outvalue") }>{ props.details.status }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">First Name: </label>
                    <span { ...testAttributes("outvalue") }>{ props.details.firstName }</span>
                </div>
                <div className="column">
                    <label className="label">Last Name: </label>
                    <span { ...testAttributes("outvalue") }>{ props.details.lastName }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">Nick name: </label>
                    <span { ...testAttributes("outvalue") }>{ props.details.nickName || "-" }</span>
                </div>
                <div className="column">
                    <label className="label">Phone no: </label>
                    <span { ...testAttributes("outvalue") }>{ props.details.phone || "-" }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">Description: </label>
                    <span { ...testAttributes("outvalue") }>{ props.details.description || "-" }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">Tags: </label>
                    <div className="tags" { ...testAttributes("outvalue") }>
                        {
                            props.details.tags.map(tagVal =>
                                <span
                                    className="tag is-link"
                                    key={ tagVal + "-tag-key" }
                                >
                                    { tagVal }
                                </span>
                            )
                        }
                        { props.details.tags.length === 0 &&
                            <span>-</span>
                        }
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">Created Date: </label>
                    <span { ...testAttributes("outvalue") }>{ props.details.auditDetails.createdOn instanceof Date ? dateutil.format(props.details.auditDetails.createdOn, "MM-DD-YYYY hh:mm:ss A") : "-" }</span>
                </div>
                <div className="column">
                    <label className="label">Last Updated Date: </label>
                    <span { ...testAttributes("outvalue") }>{ props.details.auditDetails.updatedOn instanceof Date ? dateutil.format(props.details.auditDetails.updatedOn, "MM-DD-YYYY hh:mm:ss A") : "-" }</span>
                </div>
            </div>
        </section>
    );
};

