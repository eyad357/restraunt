import { Link } from "react-router-dom";
import { useOrdersTranslation } from "../hooks/useOrdersTranslation";

export function OrdersHeader() {
  const t = useOrdersTranslation();

  return (
    <header className="orders-header">
      <div>
        <h1 className="orders-header__title">{t("orders.header.title")}</h1>
        <p className="orders-header__subtitle">{t("orders.header.subtitle")}</p>
      </div>
      <Link to="/orders/new" className="btn btn--primary">
        {t("orders.header.newOrder")}
      </Link>
    </header>
  );
}
