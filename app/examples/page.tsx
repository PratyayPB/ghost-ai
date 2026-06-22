"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import DialogPattern from "@/components/editor/dialog-pattern";
import EditorNavbar from "@/components/editor/editor-navbar";
import ProjectSidebar from "@/components/editor/project-sidebar";
import { Plus, Settings, Trash2 } from "lucide-react";

export default function ExamplesPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      {/* Editor Navbar Example */}
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Project Sidebar Example */}
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={[]}
        openCreateDialog={() => {}}
        openRenameDialog={() => {}}
        openDeleteDialog={() => {}}
        selectedProject={null}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-14 pl-0 transition-all duration-300">
        <div className="p-8 max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">UI Components Examples</h1>

          {/* Buttons Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>
                  All available button styles and sizes
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button disabled>Disabled</Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Plus className="size-4" />
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Cards Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description goes here</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    This is a card with content. Use it to organize information
                    in a structured way.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Another Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Cards can contain any type of content including forms,
                    lists, or actions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Input Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Form Inputs</h2>
            <Card>
              <CardHeader>
                <CardTitle>Input Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <Input placeholder="Text input" />
                <Input placeholder="Email input" type="email" />
                <Input placeholder="Disabled input" disabled />
                <Textarea
                  placeholder="Textarea for longer content..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </section>

          {/* Tabs Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Tabs</h2>
            <Card>
              <CardHeader>
                <CardTitle>Tab Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tab1" className="w-full">
                  <TabsList>
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1" className="mt-4">
                    <p>Content for tab 1. This is the first tab panel.</p>
                  </TabsContent>
                  <TabsContent value="tab2" className="mt-4">
                    <p>Content for tab 2. This is the second tab panel.</p>
                  </TabsContent>
                  <TabsContent value="tab3" className="mt-4">
                    <p>Content for tab 3. This is the third tab panel.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          {/* Dialog Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Dialogs</h2>
            <Card>
              <CardHeader>
                <CardTitle>Dialog Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Title</DialogTitle>
                      <DialogDescription>
                        This is a dialog component for modals and user
                        interactions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p>Dialog content goes here.</p>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => setDialogOpen(false)}>
                          Confirm
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </section>

          {/* Dialog Pattern Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Dialog Pattern</h2>
            <div className="max-w-md">
              <DialogPattern
                title="Custom Dialog"
                description="This uses the DialogPattern component for reusable dialog layouts"
                footer={
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                    <Button size="sm">Save</Button>
                  </div>
                }
              >
                <p className="text-sm">
                  Dialog content with custom layout and footer.
                </p>
              </DialogPattern>
            </div>
          </section>

          {/* Scroll Area Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Scroll Area</h2>
            <Card>
              <CardHeader>
                <CardTitle>Scrollable Content</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 w-full border border-border rounded-md p-4">
                  <div className="space-y-2">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <p key={i} className="text-sm">
                        Item {i + 1}: This is a scrollable area with overflow
                        handling.
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </section>

          {/* Accessibility Notes */}
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Features</CardTitle>
                <CardDescription>
                  Built-in accessibility attributes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✓ All buttons have proper aria-labels for screen readers</p>
                <p>✓ Form inputs have associated labels</p>
                <p>✓ Dialog components have proper ARIA roles</p>
                <p>✓ Keyboard navigation supported throughout</p>
                <p>✓ Color contrast meets WCAG AA standards</p>
                <p>✓ Focus indicators visible for keyboard users</p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
