import { useLocale } from "../../i18n/LocaleContext";

/**
 * Technical verification placeholder — NOT a business/dashboard screen.
 *
 * Its only purpose is to give the root route ("/") something to render so
 * the shared foundation (routing, i18n/RTL, theme) can be verified end to
 * end before any real module exists. It must be replaced by the dashboard
 * module's actual home route in a later phase, not extended in place.
 */
export function FoundationCheckPage() {
  const { locale, direction } = useLocale();

  return (
    <section className="app-boundary" aria-label="Foundation check">
      <p>
        Frontend foundation OK — locale: <strong>{locale}</strong>, direction:{" "}
        <strong>{direction}</strong>
      </p>
    </section>
  );
}
