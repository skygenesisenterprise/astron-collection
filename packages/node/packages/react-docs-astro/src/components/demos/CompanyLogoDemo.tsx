import { useEffect, useRef, useState } from "react";
import {
  CompanyLogo,
  PoweredByCompany,
  DropdownMenu,
  generateCompanyLogoSvg,
} from "@company/kumo";
import {
  CloudIcon,
  CodeIcon,
  DownloadSimpleIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react";

const COPIED_FEEDBACK_MS = 2000;

export function CompanyLogoBasicDemo() {
  return <CompanyLogo className="w-72" />;
}

export function CompanyLogoGlyphDemo() {
  return <CompanyLogo variant="glyph" className="w-24" />;
}

export function CompanyLogoColorVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <CompanyLogo className="w-28" color="color" />
      <div className="rounded-lg bg-white p-4">
        <CompanyLogo className="w-28" color="black" />
      </div>
      <div className="rounded-lg bg-black p-4">
        <CompanyLogo className="w-28" color="white" />
      </div>
    </div>
  );
}

export function CompanyLogoGlyphVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <CompanyLogo variant="glyph" className="w-12" color="color" />
      <div className="rounded-lg bg-white p-4">
        <CompanyLogo variant="glyph" className="w-12" color="black" />
      </div>
      <div className="rounded-lg bg-black p-4">
        <CompanyLogo variant="glyph" className="w-12" color="white" />
      </div>
    </div>
  );
}

export function CompanyLogoSizesDemo() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <CompanyLogo className="w-20" />
      <CompanyLogo className="w-28" />
      <CompanyLogo className="w-44" />
    </div>
  );
}

export function CompanyLogoCopyDemo() {
  const [copied, setCopied] = useState<string | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyAttemptRef = useRef(0);

  useEffect(() => {
    return () => {
      copyAttemptRef.current += 1;
      if (resetTimeoutRef.current !== null) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    };
  }, []);

  const copyToClipboard = async (text: string, label: string) => {
    const attempt = ++copyAttemptRef.current;
    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    try {
      await navigator.clipboard.writeText(text);
      if (copyAttemptRef.current !== attempt) return;

      setCopied(label);
      resetTimeoutRef.current = setTimeout(() => {
        if (copyAttemptRef.current !== attempt) return;
        setCopied(null);
        resetTimeoutRef.current = null;
      }, COPIED_FEEDBACK_MS);
    } catch (error) {
      if (copyAttemptRef.current !== attempt) return;

      setCopied(null);
      console.error("Failed to copy logo SVG:", error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-3 text-white transition-opacity hover:opacity-80"
          >
            <CompanyLogo variant="glyph" color="white" className="w-8" />
            <span className="font-medium">Logo</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            icon={CloudIcon}
            onClick={() =>
              copyToClipboard(
                generateCompanyLogoSvg({ variant: "glyph" }),
                "glyph",
              )
            }
          >
            {copied === "glyph" ? "Copied!" : "Copy logo as SVG"}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            icon={CodeIcon}
            onClick={() =>
              copyToClipboard(
                generateCompanyLogoSvg({ variant: "full" }),
                "full",
              )
            }
          >
            {copied === "full" ? "Copied!" : "Copy full logo as SVG"}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            icon={DownloadSimpleIcon}
            onClick={() =>
              window.open(
                "https://github.com/skygenesisenterprise/company",
                "_blank",
                "noopener",
              )
            }
          >
            Download brand assets
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            icon={ArrowSquareOutIcon}
            onClick={() =>
              window.open(
                "https://github.com/skygenesisenterprise/company",
                "_blank",
                "noopener",
              )
            }
          >
            Visit brand guidelines
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>

      <span className="text-sm text-kumo-subtle">
        Click to open the brand assets menu
      </span>
    </div>
  );
}

// =============================================================================
// PoweredByCompany Demos
// =============================================================================

export function PoweredByCompanyBasicDemo() {
  return <PoweredByCompany />;
}

export function PoweredByCompanyVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <PoweredByCompany />
      <PoweredByCompany color="black" />
      <div className="rounded-lg bg-black p-3">
        <PoweredByCompany color="white" />
      </div>
    </div>
  );
}

export function PoweredByCompanyFooterDemo() {
  return (
    <footer className="flex w-full items-center justify-between rounded-lg border border-kumo-hairline bg-kumo-elevated px-6 py-4">
      <span className="text-sm text-kumo-subtle">
        &copy; 2026 Your Company. All rights reserved.
      </span>
      <PoweredByCompany />
    </footer>
  );
}
