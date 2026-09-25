import { NavLink } from "react-router-dom";
import { useMenuTranslation } from "../hooks/useMenuTranslation";

/**
 * The shared AppShell (frozen foundation) has no navigation menu yet, and
 * adding one there would be a shared-file change outside this module's
 * scope. This is a small, module-local nav so a user isn't stuck typing
 * URLs to move between Categories and Products — a real usability gap,
 * not scope creep.
 */
export function MenuNav() {
  const t = useMenuTranslation();
  return (
    <nav className="menu-nav">
      <NavLink to="/menu/categories" className={({ isActive }) => `menu-nav__link${isActive ? " menu-nav__link--active" : ""}`}>
        {t("menu.nav.categories")}
      </NavLink>
      <NavLink to="/menu/products" className={({ isActive }) => `menu-nav__link${isActive ? " menu-nav__link--active" : ""}`}>
        {t("menu.nav.products")}
      </NavLink>
    </nav>
  );
}
