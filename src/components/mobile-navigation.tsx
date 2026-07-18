"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface NavigationItem {
  href: string;
  label: string;
}

interface MobileNavigationProps {
  ariaLabel: string;
  closeLabel: string;
  items: readonly NavigationItem[];
  openLabel: string;
}

export function MobileNavigation({
  ariaLabel,
  closeLabel,
  items,
  openLabel,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      setIsOpen(false);
      toggleButtonRef.current?.focus();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const activeLabel = isOpen ? closeLabel : openLabel;

  return (
    <div className="mobile-navigation">
      {isOpen ? <div className="mobile-menu-backdrop" aria-hidden="true" /> : null}
      <button
        ref={toggleButtonRef}
        className="mobile-menu-toggle"
        type="button"
        aria-controls="mobile-navigation-panel"
        aria-expanded={isOpen}
        aria-label={activeLabel}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="mobile-menu-icon-stack" aria-hidden="true">
          <Menu
            className="mobile-menu-icon mobile-menu-icon-open"
            size={23}
            stroke="currentColor"
            strokeWidth={1.8}
          />
          <X
            className="mobile-menu-icon mobile-menu-icon-close"
            size={23}
            stroke="currentColor"
            strokeWidth={1.8}
          />
        </span>
      </button>
      <nav
        id="mobile-navigation-panel"
        className="mobile-menu-panel"
        aria-label={ariaLabel}
        hidden={!isOpen}
      >
        {items.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
