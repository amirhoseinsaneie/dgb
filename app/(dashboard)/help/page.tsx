import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="Help"
        subtitle="Guide to using Decision Governance Board"
        breadcrumbs={[{ label: "Help", href: "/help" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Recommended flow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. Create a board for your project or team.</p>
          <p>2. Add decisions with clear owner, criteria, and options.</p>
          <p>3. Move decisions in Kanban from Draft to Done.</p>
          <p>4. Use quality gates to prevent risky or incomplete moves.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality Gates</CardTitle>
          <CardDescription>Default required checks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>- Owner required before Review</p>
          <p>- Criteria required before Review</p>
          <p>- Due date required before Review</p>
          <p>- Irreversible decisions require options, risks, and evidence</p>
          <p>- High impact decisions require approvers</p>
          <p>- Confidence under threshold requires validation plan</p>
        </CardContent>
      </Card>
    </div>
  );
}
