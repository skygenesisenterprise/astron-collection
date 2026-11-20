import {
  type CSSProperties,
  type Ref,
  createContext,
  forwardRef,
  useContext,
} from "react";
import {
  Button,
  LinkButton,
  type ButtonProps,
  type KumoButtonSize,
  type KumoButtonVariant,
  type LinkButtonProps,
} from "../button/button";
import { cn } from "../../utils/cn";
import type { KumoBannerVariant } from "./banner";

/**
 * Visual variant for a `Banner.Action`, aligned with `Button`'s `variant` naming.
 * - `"primary"` — filled accent gradient for the main action.
 * - `"secondary"` — transparent with an accent-hued outline (same hue as the banner).
 * - `"ghost"` — text-only accent action with a faint accent-tinted hover.
 */
export type BannerActionVariant = Extract<
  KumoButtonVariant,
  "primary" | "secondary" | "ghost"
>;

/**
 * Size of a `Banner.Action`, matching the equivalent `Button` size specs.
 * - `"xs"` — extra small for dense/compact banners.
 * - `"sm"` — small (default), the standard banner CTA size.
 */
export type BannerActionSize = Extract<KumoButtonSize, "xs" | "sm">;

/** Value shared from the `Banner` root to its `Banner.Action` children. */
export interface BannerActionContextValue {
  /** Banner variant, used to pick the matching accent color. */
  variant: KumoBannerVariant;
  /** Action size derived from the banner's own size. */
  size: BannerActionSize;
}

/**
 * Propagates the banner's variant and action size to `Banner.Action`
 * children so each CTA can self-style without prop drilling:
 * - `variant` — selects the matching accent color.
 * - `size` — a compact `size="sm"` banner renders actions at `"xs"`, and a
 *   `"base"` banner renders them at `"sm"`.
 *
 * The `Banner` root always overrides these defaults via a Provider; the literals
 * mirror a default, base-size banner (kept as literals to avoid a runtime import
 * cycle with `banner.tsx`).
 */
export const BannerActionContext = createContext<BannerActionContextValue>({
  variant: "default",
  size: "sm",
});

/** Per-banner-variant colors passed to the underlying `Button`. */
const BANNER_ACTION_ACCENTS: Record<
  KumoBannerVariant,
  { accent: string; secondary: string; ghost: string }
> = {
  default: {
    accent: "var(--color-zenth-info)",
    secondary:
      "text-inherit ring-zenth-info/50 fill-zenth-info hover:!text-inherit hover:!ring-zenth-info/50 hover:bg-zenth-info/10",
    ghost: "text-inherit fill-zenth-info hover:bg-zenth-info/10",
  },
  alert: {
    accent: "var(--color-zenth-warning)",
    secondary:
      "text-inherit ring-zenth-warning/50 fill-zenth-warning hover:!text-inherit hover:!ring-zenth-warning/50 hover:bg-zenth-warning/10",
    ghost: "text-inherit fill-zenth-warning hover:bg-zenth-warning/10",
  },
  error: {
    accent: "var(--color-zenth-danger)",
    secondary:
      "text-inherit ring-zenth-danger/50 fill-zenth-danger hover:!text-inherit hover:!ring-zenth-danger/50 hover:bg-zenth-danger/10",
    ghost: "text-inherit fill-zenth-danger hover:bg-zenth-danger/10",
  },
  secondary: {
    accent: "var(--color-neutral-700, oklch(37.1% 0 0))",
    secondary:
      "text-inherit ring-zenth-focus/20 fill-zenth-subtle hover:!text-inherit hover:!ring-zenth-focus/20 hover:bg-zenth-contrast/10",
    ghost: "text-inherit fill-zenth-subtle hover:bg-zenth-contrast/10",
  },
};

function bannerActionAccentVars(accent: string) {
  return {
    "--zenth-button-emphasis-ring": `color-mix(in oklch, ${accent}, black 10%)`,
    "--zenth-button-emphasis-bg": `color-mix(in oklch, ${accent}, white 30%)`,
    "--zenth-button-emphasis-gradient-start": `color-mix(in oklch, ${accent}, white 15%)`,
    "--zenth-button-emphasis-gradient-end": accent,
  } satisfies CSSProperties & Record<`--${string}`, string>;
}

type WithBannerActionVariants<Props> = Props extends unknown
  ? Omit<Props, "size" | "variant"> & {
      /**
       * Visual variant of the CTA, aligned with `Button`'s `variant` naming.
       * - `"primary"` — filled accent gradient for the main action (default).
       * - `"secondary"` — transparent with an accent-hued outline matching the banner.
       * - `"ghost"` — text-only accent action with a faint accent-tinted hover.
       * @default "primary"
       */
      variant?: BannerActionVariant;
    }
  : never;

type BannerActionButtonProps = WithBannerActionVariants<ButtonProps> & {
  href?: never;
};

type BannerActionLinkProps = WithBannerActionVariants<LinkButtonProps> & {
  /**
   * Renders the action as a link via `LinkButton`, so it uses the app's
   * `LinkProvider` component for client-side routing.
   */
  href: string;
};

/** Props for {@link BannerAction}. Pass `href` to render a link. */
export type BannerActionProps = BannerActionButtonProps | BannerActionLinkProps;

/**
 * A banner CTA built on Kumo's `Button`, or `LinkButton` when `href` is set. It
 * inherits their sizing, interaction, and accessibility behavior while supplying
 * banner-specific accent styles.
 *
 * @example
 * ```tsx
 * <Banner.Action onClick={retry}>Retry</Banner.Action>
 * <Banner.Action href="/billing">Manage payments</Banner.Action>
 * <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
 * ```
 */
export const BannerAction = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  BannerActionProps
>(function BannerAction(props, ref) {
  const banner = useContext(BannerActionContext);
  const variant = props.variant ?? "primary";
  const styles = BANNER_ACTION_ACCENTS[banner.variant];
  const shared = {
    variant: variant === "secondary" ? "outline" : variant,
    size: banner.size,
    className: cn(variant !== "primary" && styles[variant], props.className),
    style:
      variant === "primary"
        ? { ...bannerActionAccentVars(styles.accent), ...props.style }
        : props.style,
  } as const;

  if (props.href !== undefined) {
    return (
      <LinkButton ref={ref as Ref<HTMLAnchorElement>} {...props} {...shared} />
    );
  }

  return <Button ref={ref as Ref<HTMLButtonElement>} {...props} {...shared} />;
});

BannerAction.displayName = "Banner.Action";
