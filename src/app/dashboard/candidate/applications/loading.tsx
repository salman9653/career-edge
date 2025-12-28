import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function ApplicationsLoading() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 bg-background px-4 md:px-6 sticky top-0 z-30 md:static">
        <h1 className="font-headline text-xl font-semibold md:ml-0 ml-12">My Activity</h1>
        <div className="w-full max-w-sm"><Skeleton className="h-9 w-full rounded-md" /></div>
      </header>
        <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:p-6">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={35} minSize={25}>
               <div className="flex flex-col h-full">
                  <div className="grid w-full grid-cols-2 gap-2 rounded-lg bg-muted p-1 mb-4">
                      <Skeleton className="h-9 w-full rounded-md" />
                      <Skeleton className="h-9 w-full rounded-md" />
                  </div>
                   <div className="flex-1 overflow-auto pr-4 space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                           <Card key={i} className="mb-2">
                                <CardHeader className="pb-2">
                                    <div className="flex gap-4">
                                        <Skeleton className="h-12 w-12 rounded-lg" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-4">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </CardContent>
                           </Card>
                        ))}
                    </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={65} minSize={40}>
                <div className="p-6 space-y-6">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
    </>
  )
}
