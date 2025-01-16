import { FunctionComponent, useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { getLogger, RouteHandlerResponse, StatBelongsTo } from "../services";
import { Animated, Th } from "../../../components";
import ReactMarkdown from "react-markdown";
import { HomepageDetailLoaderResource } from "../route-handlers/loader";
import { StatsExpenseResource } from "../services/field-types";
import { formatAmount } from "../../../formatters";


const fcLogger = getLogger("FC.homepage.view.stats", null, null, "DISABLED");

interface StatTableDetails {
    belongsTo: StatBelongsTo;
    belongsToLabel: string;
    totalAmount: string;
    averageByMonth: string;
}

const getNumber = (num: string) => {
    return Number(num || 0);
};

export const StatsViewPage: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<HomepageDetailLoaderResource, null>;
    const [errorMessage, setErrorMessage] = useState("");
    const [year, setYear] = useState("");
    const [statTableDetailList, setStatTableDetailList] = useState<StatTableDetails[]>([]);


    useEffect(() => {
        const logger = getLogger("useEffect.dep[loaderData]", fcLogger);
        const thisYear = String(new Date().getFullYear());
        logger.debug("loaderData =", loaderData, ", thisYear =", thisYear);
        if (loaderData.type === "success") {
            setErrorMessage("");
            setYear(loaderData.data.stats[0].year);
            let nMonths = 12;
            if (loaderData.data.stats[0].year === thisYear) {
                nMonths = new Date().getMonth() + 1;
            }

            const statsMap = loaderData.data.stats.reduce((prev: Record<string, StatsExpenseResource>, curr) => {
                prev[curr.belongsTo] = curr;
                return prev;
            }, {});

            const myStatTableDetailList = [];
            myStatTableDetailList.push({
                belongsTo: StatBelongsTo.Income,
                belongsToLabel: "Income",
                totalAmount: formatAmount(statsMap[StatBelongsTo.Income].details.total),
                averageByMonth: formatAmount(Number(statsMap[StatBelongsTo.Income].details.total) / nMonths)
            });
            const purchaseAfterRefundTotalAmt = getNumber(statsMap[StatBelongsTo.Purchase].details.total) - getNumber(statsMap[StatBelongsTo.Refund].details.total);
            myStatTableDetailList.push({
                belongsTo: StatBelongsTo.PurchaseMinusRefund,
                belongsToLabel: "Purchase after getting refund",
                totalAmount: formatAmount(purchaseAfterRefundTotalAmt),
                averageByMonth: formatAmount(purchaseAfterRefundTotalAmt / nMonths)
            });
            myStatTableDetailList.push({
                belongsTo: StatBelongsTo.Purchase,
                belongsToLabel: "Purchase",
                totalAmount: formatAmount(statsMap[StatBelongsTo.Purchase].details.total),
                averageByMonth: formatAmount(getNumber(statsMap[StatBelongsTo.Purchase].details.total) / nMonths)
            });
            myStatTableDetailList.push({
                belongsTo: StatBelongsTo.Refund,
                belongsToLabel: "Refund",
                totalAmount: formatAmount(statsMap[StatBelongsTo.Refund].details.total),
                averageByMonth: formatAmount(getNumber(statsMap[StatBelongsTo.Refund].details.total) / nMonths)
            });
            setStatTableDetailList(myStatTableDetailList);

        } else if (loaderData.type === "error") {
            setErrorMessage(loaderData.errorMessage);
            setYear(prev => (prev || thisYear));
            setStatTableDetailList([]);
        }
    }, [loaderData]);

    return (
        <section>
            <Animated animateOnMount={ false } isPlayIn={ !!errorMessage } animatedIn="fadeInDown" animatedOut="fadeOutUp" isVisibleAfterAnimateOut={ false } scrollBeforePlayIn={ true }>
                <div className="columns is-centered">
                    <div className="column is-four-fifths">
                        <article className="message is-danger mb-3">
                            <div className="message-body">
                                <ReactMarkdown children={ errorMessage } />
                            </div>
                        </article>
                    </div>
                </div>
            </Animated>

            <h3 className="subtitle"> Year: { year } </h3>
            <div className="columns">
                <div className="column">
                    <table className="table is-hoverable">
                        <thead>
                            <tr>
                                <Th label="Belongs To" sortable={ false } />
                                <Th label="Total Amount" sortable={ false } />
                                <Th label="Average By Month" sortable={ false } />
                            </tr>
                        </thead>
                        <tbody>
                            {
                                statTableDetailList.map(statDetail => (
                                    <tr key={ statDetail.belongsTo }>
                                        <Th label={ statDetail.belongsToLabel } sortable={ false } />
                                        <td> { statDetail.totalAmount } </td>
                                        <td> { statDetail.averageByMonth } </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

