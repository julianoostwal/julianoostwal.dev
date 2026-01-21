"use client"

import NextLink from "next/link"
import { Button } from "@heroui/button"

type ButtonLinkProps = Omit<React.ComponentProps<typeof Button>, "as" | "href"> & {
  href: string
}

export function ButtonLink({ href, ...props }: ButtonLinkProps) {
  return <Button as={NextLink} href={href} {...props} />
}

