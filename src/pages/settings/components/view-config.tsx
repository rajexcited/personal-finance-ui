import "./view-config.css";
import { FunctionComponent } from "react";
import { ConfigType } from "../../../services";
import dateutil from "date-and-time";
import { Input } from "../../../components";


interface ViewConfigProps {
    details: ConfigType;
}

const ViewConfig: FunctionComponent<ViewConfigProps> = (props) => {

    return (
        <section className="view-config-settings">
            <div className="columns">
                <div className="column">
                    <label className="label">Name: </label>
                    <span>{ props.details.name }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <label className="label">Status: </label>
                    <span>{ props.details.status }</span>
                </div>
                <div className="column">
                    <label className="label">Relations: </label>
                    <span>{ props.details.relations.join(", ") || "-" }</span>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    {
                        !props.details.color &&
                        <>
                            <label className="label">Color: </label>
                            <span> - </span>
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
                <div className="column">
                    <label className="label">Icon: </label>
                    <span>{ props.details.icon || "-" }</span>
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
                    <span>{ props.details.createdOn && dateutil.format(props.details.createdOn || "-", "MM-DD-YYYY hh:mm:ss A") || "-" }</span>
                </div>
                <div className="column">
                    <label className="label">Last Updated Date: </label>
                    <span>{ props.details.updatedOn && dateutil.format(props.details.updatedOn, "MM-DD-YYYY hh:mm:ss A") || "-" }</span>
                </div>
            </div>
        </section>
    );
};

export default ViewConfig;