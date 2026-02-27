import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-2 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="space-y-1.5">
        {breadcrumbs && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <div key={crumb.label} className="flex items-center">
                    <BreadcrumbItem>
                      {isLast || !crumb.href ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator>
                        <ChevronLeft className="size-3.5" />
                      </BreadcrumbSeparator>
                    )}
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm lg:text-base max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
