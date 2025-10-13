import { cn } from "@/lib/utils";
import { Landmark } from "lucide-react";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <Landmark
      className={cn("text-primary", props.className)}
      {...props}
    />
  );
}
