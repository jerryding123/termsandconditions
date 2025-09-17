import { forwardRef, Button, ButtonProps } from "@chakra-ui/react";
import Link from "next/link";

export interface NavLinkProps extends ButtonProps {
  isActive?: boolean;
  href?: string;
  id?: string;
  variant?: string;
}

export const NavLink = forwardRef<NavLinkProps, "a">((props, ref) => {
  const { href, type, isActive, variant, ...rest } = props;
  
  // Use the passed variant instead of hardcoding "nav-link"
  // If no variant is specified, default to "nav-link"
  const buttonVariant = variant || "nav-link";
  
  // Make the fontWeight bold for primary variant
  const fontWeight = variant === "primary" ? "bold" : "medium";
  
  return (
    <Button
      as={Link}
      href={href}
      ref={ref}
      variant={buttonVariant}
      lineHeight="2rem"
      isActive={isActive}
      fontWeight={fontWeight}
      {...rest}
    />
  );
});

NavLink.displayName = "NavLink";