import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, MessageCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground mt-1">Get help with using Horizon.</p>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                Documentation
              </CardTitle>
              <CardDescription>Learn how to use Horizon with our comprehensive guides.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </CardTitle>
              <CardDescription>Reach out to our support team for assistance.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
