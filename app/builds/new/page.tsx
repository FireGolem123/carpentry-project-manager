"use client";

import { useState, useTransition } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BuildForm } from "@/components/builds/BuildForm";
import { createBuild } from "@/lib/actions";
import { ParsedBuild } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";

function QuickDescribeTab() {
  const [description, setDescription] = useState("");
  const [parsed, setParsed] = useState<ParsedBuild | null>(null);
  const [isParsing, startParsing] = useTransition();

  async function handleParse() {
    if (!description.trim()) return;
    startParsing(async () => {
      try {
        const res = await fetch("/api/parse-build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description }),
        });
        if (!res.ok) throw new Error("Failed to parse");
        const data = await res.json();
        setParsed(data);
      } catch {
        toast.error("Could not parse description. Try filling in the form manually.");
      }
    });
  }

  if (parsed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Fields filled from your description — review and save</span>
          <button
            onClick={() => setParsed(null)}
            className="ml-auto text-accent hover:underline"
          >
            Re-describe
          </button>
        </div>
        <BuildForm
          initialData={parsed}
          onSubmit={createBuild}
          submitLabel="Save Build"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Describe the build in plain English — Claude will fill in the fields for you.
      </p>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g. just finished a walnut coffee table, took about 20 hours, sold it to my neighbour for $600 on facebook, spent around $120 on materials"
        rows={5}
        className="text-base"
      />
      <Button
        onClick={handleParse}
        disabled={!description.trim() || isParsing}
        className="w-full gap-2"
      >
        {isParsing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Parsing…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Parse with AI
            <ChevronRight className="w-4 h-4 ml-auto" />
          </>
        )}
      </Button>

      <Card className="bg-muted border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Example:</strong> "white oak dining table, took 35h, danish oil finish, sold for $1200 on facebook marketplace, materials cost about $200, sold to a couple in town"
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewBuildPage() {
  return (
    <PageLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Log a Build</h1>

        <Tabs defaultValue="describe">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="describe" className="flex-1">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Quick Describe
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex-1">
              Fill Form
            </TabsTrigger>
          </TabsList>

          <TabsContent value="describe">
            <QuickDescribeTab />
          </TabsContent>

          <TabsContent value="manual">
            <BuildForm onSubmit={createBuild} submitLabel="Save Build" />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
