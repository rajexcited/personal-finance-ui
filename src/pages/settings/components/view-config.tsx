import "./view-config.css";
import { FunctionComponent } from "react";
import { ConfigResource } from "../services";
import { Input } from "../../../components";
import { testAttributes, formatTimestamp } from "../../../shared";



interface ViewConfigProps {
    details: ConfigResource;
}

const ViewConfig: FunctionComponent<ViewConfigProps> = (props) => {

    return (
        <section className="view-config-settings">
            <div className="columns">
                <div className="column">
                    <label className="label">Name: </label>
                    <span { ...testAttributes("outvalue") }>{ props.details.name }</span>
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
                    {
                        !props.details.color &&
                        <>
                            <label className="label">Color: </label>
                            <span { ...testAttributes("outvalue") }>-</span>
                        </>
                    }
                    {
                        props.details.color &&
                        <Input
                            id={ props.details.name + "cfg-color-inp" }
                            label="Color:"
                            initialValue={ props.details.color }
                            type="color"
                            disabled={ true }
                        />
                    }
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
                    <span { ...testAttributes("outvalue") }>{ props.details.auditDetails.createdOn instanceof Date ? formatTimestamp(props.details.auditDetails.createdOn, "MM-DD-YYYY hh:mm:ss A") : "-" }</span>
                </div>
                <div className="column">
                    <label className="label">Last Updated Date: </label>
                    <span { ...testAttributes("outvalue") }>{ props.details.auditDetails.updatedOn instanceof Date ? formatTimestamp(props.details.auditDetails.updatedOn, "MM-DD-YYYY hh:mm:ss A") : "-" }</span>
                </div>
            </div>
        </section>
    );
};

export default ViewConfig;