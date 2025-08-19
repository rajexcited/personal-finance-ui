import "./settings-root.css";
import { FunctionComponent } from "react";
import { Outlet } from "react-router-dom";
import { faCoins, faGear, faMoneyBills, faPersonCircleQuestion, faPiggyBank, faUserAlt, faUserSecret } from "@fortawesome/free-solid-svg-icons";
// importing from file to prevent circular dependency error.
import { getFullPath } from "../../root/components/navigation/page-url";
import { getLogger } from "../services";
import { DeviceMode, useOrientation } from "../../../hooks";
import { SettingsRootHeroTabs } from "./settings-root-herotabs";

const fcLogger = getLogger("FC.SettingsRootPage", null, null, "DISABLED");

export const TAB_HEADS = [
    { id: "root-stngs", title: "General Settings", url: getFullPath("settingsRoot"), icon: faGear },
    { id: "purchase-type-stngs", title: "Purchase Type", url: getFullPath("purchaseTypeSettings"), icon: faCoins },
    { id: "payment-account-type-stngs", title: "Payment Account Type", url: getFullPath("pymtAccountTypeSettings"), icon: faMoneyBills },
    { id: "refund-reason-stngs", title: "Refund Reason", url: getFullPath("refundReasonSettings"), icon: faPersonCircleQuestion },
    { id: "income-type-stngs", title: "Income Type", url: getFullPath("incomeTypeSettings"), icon: faPiggyBank },
    { id: "share-person-stngs", title: "Share Person", url: getFullPath("sharePersonSettings"), icon: faUserAlt },
    { id: "profile-stngs", title: "Profile", url: getFullPath("profileSettings"), icon: faUserAlt },
    { id: "security-stngs", title: "Security", url: getFullPath("securitySettings"), icon: faUserSecret },
];

export const SettingsRootPage: FunctionComponent = () => {
    const { resultedDevice: deviceMode } = useOrientation(DeviceMode.Mobile);

    fcLogger.debug("deviceMode=", deviceMode);
    return (
        <section className="settings-section">
            {
                deviceMode === DeviceMode.Desktop &&
                <SettingsRootHeroTabs />
            }
            {
                deviceMode === DeviceMode.Mobile &&
                <Outlet />
            }
        </section>
    );
};

