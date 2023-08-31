import { FunctionComponent, useState } from "react";
import { ExpenseData } from "./expense-context";
import { faAngleUp, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import VerifyIndicator from "../../components/verify-indicator";


interface ExpenseItemCardProps {
    id: string;
    details: ExpenseData;
}

const ExpenseItemView: FunctionComponent<ExpenseItemCardProps> = (props) => {
    const [isBodyOpen, setBodyOpen] = useState(false);
    const onClickBodyToggleHandler: React.MouseEventHandler<HTMLButtonElement | HTMLParagraphElement> = event => {
        event.preventDefault();
        setBodyOpen((oldstate) => !oldstate);
    };

    const itemizeAmounts = props.details.expenseItems && props.details.expenseItems.map(it => Number(it.amount)).filter(n => !isNaN(n));
    let totalItemizedAmount = 0;
    if (itemizeAmounts) {
        totalItemizedAmount = itemizeAmounts.reduce((t, n) => t + n, 0);
    }
    const expenseAmount = isNaN(Number(props.details.amount)) ? 0 : Number(props.details.amount);
    const diffAmount = expenseAmount - totalItemizedAmount;

    return (
        <section className="container mb-2 p-2">
            <div className="card">
                <header className="card-header">
                    <div className="card-header-title" onClick={ onClickBodyToggleHandler }>
                        <div className="card-header-icon">
                            <div className="columns">
                                <div className="column">
                                    <span className="mx-3">
                                        { props.details.billname }
                                    </span>
                                </div>
                                <div className="column">
                                    <span className="mx-3">
                                        { props.details.amount }
                                    </span>
                                </div>
                                <div className="column">
                                    <span className="mx-3">
                                        <VerifyIndicator
                                            id={ "xpns-verify-" + props.id + props.details.expenseId }
                                            key={ "xpns-verify-" + props.id + props.details.expenseId }
                                            disabled={ true } />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                <label className="label">Amount: </label>
                                <span>{ props.details.amount }</span>
                            </div>
                            <div className="column">
                                <label className="label">Payment Account: </label>
                                <span>{ props.details.pymtacc }</span>
                            </div>
                            <div className="column">
                                <label className="label">Purchase Date: </label>
                                <span>{ props.details.purchasedDate.toDateString() }</span>
                            </div>
                        </div>
                        <div className="columns is-variable">
                            <div className="column">
                                <label className="label">Tags: </label>
                                <div className="tags">
                                    {
                                        props.details.tags &&
                                        props.details.tags.split(",").map(
                                            tag => <span className="tag is-link">{ tag }</span>
                                        )
                                    }
                                </div>

                            </div>
                            <div className="column">
                                <label className="label">Description: </label>
                                <span>{ props.details.description }</span>
                            </div>
                        </div>
                        {
                            props.details.expenseItems && props.details.expenseItems.length &&
                            <div className="columns is-variable">
                                <div className="column">
                                    <label className="label">Expense Breakdown: </label>
                                    <div className="table-container">
                                        <table className="table is-bordered is-striped is-narrow- is-fullwidth">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Amount</th>
                                                    <th>category</th>
                                                    <th>tags</th>
                                                    <th>description</th>
                                                </tr>
                                            </thead>
                                            <tfoot>
                                                <tr>
                                                    <th>amount difference</th>
                                                    <th>{ diffAmount }</th>
                                                    <th>
                                                        {
                                                            diffAmount > 0 &&
                                                            <span>itemized amount is less than expense amount</span>
                                                        }
                                                        {
                                                            diffAmount < 0 &&
                                                            <span>itemized amount is greater than expense amount</span>
                                                        }
                                                        {
                                                            diffAmount == 0 &&
                                                            <span>itemized amount and expense amount are matched</span>
                                                        }
                                                    </th>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div> }
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

export default ExpenseItemView;