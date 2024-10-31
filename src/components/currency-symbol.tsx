import { FunctionComponent } from "react";
import './currency-symbol.css';

interface CurrencySymbolProps {
    countryCode: string;
    countryName: string;
    currencyCode: string;
    currencyName: string;
}

export const CurrencySymbol: FunctionComponent<CurrencySymbolProps> = (props) => {

    return (
        <section className="currency-symbol-section box">
            <p className="country-field tooltip" data-tooltip={ props.countryName }>
                <span className="tag is-link-is-light">{ props.countryCode }</span>
            </p>
            <p className="currency-field tooltip" data-tooltip={ props.currencyName }>
                <span className="tag is-link-is-light">{ props.currencyCode }</span>
            </p>
        </section>
    );
};
