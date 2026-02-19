import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader
        title="Help"
        subtitle="Guide to using Decision Governance Board"
        breadcrumbs={[{ label: "Help", href: "/help" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Getting started with the tool</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            1. Create a board for your project or team.
          </p>
          <p>
            2. Add decisions with clear ownership, criteria, and options.
          </p>
          <p>
            3. Use the Kanban board to move decisions through the workflow.
          </p>
          <p>
            4. Quality gates ensure decisions meet requirements before moving to Review.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality Gates</CardTitle>
          <CardDescription>Decision quality rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Owner required before moving to Review</p>
          <p>• Criteria required before Review</p>
          <p>• Due date required before Review</p>
          <p>• Irreversible decisions need Options + Risks + Evidence</p>
          <p>• High impact decisions need Approvers list</p>
          <p>• Low confidence (&lt;60%) needs Validation plan</p>
        </CardContent>
      </Card>
    </div>
  );
}
