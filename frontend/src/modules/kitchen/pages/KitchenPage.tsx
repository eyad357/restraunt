import { useKitchenTranslation } from "../hooks/useKitchenTranslation";
import { useKitchenBoard } from "../hooks/useKitchenBoard";
import { SectionState } from "../components/SectionState";
import { KitchenColumn } from "../components/KitchenColumn";
import { KITCHEN_BOARD_STATUSES, type KitchenBoardColumns } from "../types/kitchen";
import "./kitchen.css";

export function KitchenPage() {
  const t = useKitchenTranslation();
  const board = useKitchenBoard();

  return (
    <div className="kitchen-page">
      <header className="kitchen-header">
        <h1 className="kitchen-header__title">{t("kitchen.header.title")}</h1>
        <p className="kitchen-header__subtitle">{t("kitchen.header.subtitle")}</p>
      </header>

      <SectionState<KitchenBoardColumns>
        status={board.status}
        data={board.data}
        error={board.error}
        retry={board.retry}
        isEmpty={(columns) => KITCHEN_BOARD_STATUSES.every((status) => columns[status].length === 0)}
        renderEmpty={() => (
          <div className="kitchen-empty kitchen-empty--page">
            <p className="kitchen-empty__title">{t("kitchen.state.empty.title")}</p>
            <p className="kitchen-empty__body">{t("kitchen.state.empty.body")}</p>
          </div>
        )}
        renderSuccess={(columns) => (
          <div className="kitchen-board">
            {KITCHEN_BOARD_STATUSES.map((status) => (
              <KitchenColumn key={status} status={status} tickets={columns[status]} onChanged={board.retry} />
            ))}
          </div>
        )}
      />
    </div>
  );
}
