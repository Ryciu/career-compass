import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ImageIcon, AlertCircle, RotateCw, Download } from "lucide-react";

export default function VisualStory() {
  const [reportId, setReportId] = useState(null);
  const [assets, setAssets] = useState([]);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [regenId, setRegenId] = useState(null);

  const refresh = async (id) => {
    const a = await base44.entities.GeneratedVisualAsset.filter({ report_id: id });
    setAssets(a.sort((x, y) => x.slide_number - y.slide_number));
  };

  useEffect(() => {
    (async () => {
      try {
        const report = (await base44.entities.Report.filter({}))[0];
        if (report) {
          setReportId(report.id);
          const a = await base44.entities.GeneratedVisualAsset.filter({ report_id: report.id });
          setAssets(a.sort((x, y) => x.slide_number - y.slide_number));
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function runPipeline() {
    setRunning(true);
    setError("");
    // Call each stage directly so every request fits the 120s proxy window;
    // the combined orchestrator would exceed it and surface a 500.
    const stages = [
      ["analyzeReportForVisualStory", "Analysing your report…"],
      ["selectVisualStories", "Selecting the key stories…"],
      ["generateSlideBriefs", "Writing slide briefs…"],
      ["generateImagePrompts", "Crafting image prompts…"],
      ["validateSlideContent", "Fact-checking against your report…"],
      ["renderVisualSlides", "Generating infographics with gpt-image-2…"],
    ];
    try {
      for (const [fn, label] of stages) {
        setStage(label);
        const r = await base44.functions.invoke(fn, { report_id: reportId });
        if (!r?.data || r.data.error) throw new Error(r.data.error || `${fn} failed`);
      }
      await refresh(reportId);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
      setStage("");
    }
  }

  async function regenSlide(slide_number) {
    setRegenId(slide_number);
    setError("");
    try {
      const r = await base44.functions.invoke("renderSingleSlide", { report_id: reportId, slide_number });
      if (!r?.data?.asset && r?.data?.error) throw new Error(r.data.error);
      await base44.entities.GeneratedVisualAsset.filter({ report_id: reportId }).then((a) =>
        setAssets(a.sort((x, y) => x.slide_number - y.slide_number))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setRegenId(null);
    }
  }

  function downloadAsset(asset, index) {
    if (!asset.generated_asset_url) return;
    const a = document.createElement("a");
    a.href = asset.generated_asset_url;
    a.download = `career-compass-slide-${index + 1}.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function downloadAll() {
    assets.forEach((a, i) => setTimeout(() => downloadAsset(a, i), i * 400));
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6">
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl mb-3">Your career story, visualised.</h1>
          <p className="text-muted-foreground leading-relaxed max-w-xl">
            A set of editorial infographics summarising the key takeaways of your report, generated from your own evidence.
          </p>
        </div>

        {loading && <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}

        {!loading && !reportId && (
          <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-5 flex gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <p className="text-sm text-amber-900">Generate your career report first — the visual story is built from its conclusions.</p>
          </div>
        )}

        {reportId && assets.length === 0 && !running && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              This analyses your report, selects the key ideas, writes a brief for each slide, then generates the infographics with gpt-image-2. It can take a few minutes.
            </p>
            <Button onClick={runPipeline} className="rounded-full h-12 px-8">Generate my visual story</Button>
          </div>
        )}

        {running && (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{stage || "Working…"}</p>
            <p className="text-xs text-muted-foreground/60">Generating infographics with gpt-image-2 — this takes a few minutes.</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive mb-6">{error}</div>
        )}

        {assets.length > 0 && !running && (
          <div className="grid gap-6">
            <div className="flex justify-end">
              <Button onClick={downloadAll} disabled={!assets.some((a) => a.generated_asset_url)} className="rounded-full gap-2">
                <Download className="w-4 h-4" /> Pobierz wszystkie grafiki
              </Button>
            </div>
            {assets.map((a, i) => (
              <div key={a.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="aspect-[3/2] bg-muted">
                  {a.generated_asset_url ? (
                    <img src={a.generated_asset_url} alt={a.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground tabular-nums">Slide {a.slide_number}</span>
                    {a.generation_status === "failed" && <span className="text-xs text-destructive">failed</span>}
                    {a.validation_status === "valid" && <span className="text-xs text-primary">validated</span>}
                  </div>
                  <h3 className="font-heading text-lg mb-3">{a.title}</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => regenSlide(a.slide_number)}
                      disabled={regenId === a.slide_number}
                      className="rounded-full gap-2"
                    >
                      {regenId === a.slide_number ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                      Wygeneruj ponownie
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadAsset(a, i)}
                      disabled={!a.generated_asset_url}
                      className="rounded-full gap-2"
                    >
                      <Download className="w-4 h-4" /> Pobierz
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={runPipeline} className="rounded-full">Regeneruj całość</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}